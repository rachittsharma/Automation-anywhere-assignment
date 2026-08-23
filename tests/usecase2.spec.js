import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage.js';

test.describe('Use Case 2: Learning Instance API Flow (API Automation)', () => {
  let capturedAuthToken = '';

  test.beforeAll(async ({ playwright }) => {
    await test.step('Authenticate via REST API / UI Fallback to capture Auth Token', async () => {
      const authUsername = process.env.AA_USER || 'rachitsharma920@gmail.com';
      const authPassword = process.env.AA_PASS || 'R@chit920';

      const apiContext = await playwright.request.newContext();
      const authResponse = await apiContext.post(
        'https://community.cloud.automationanywhere.digital/v2/authentication',
        {
          data: {
            username: authUsername,
            password: authPassword
          }
        }
      );

      if (authResponse.status() === 200) {
        const authData = await authResponse.json();
        if (authData && authData.token) {
          capturedAuthToken = authData.token;
        }
      }

      // UI Fallback if direct API auth call requires browser context
      if (!capturedAuthToken) {
        const activeBrowser = await playwright.chromium.launch({ headless: true });
        const authBrowserPage = await activeBrowser.newPage();

        authBrowserPage.on('response', async (networkResponse) => {
          if (networkResponse.url().includes('/v2/authentication') && networkResponse.status() === 200) {
            try {
              const responseJson = await networkResponse.json();
              if (responseJson && responseJson.token && typeof responseJson.token === 'string') {
                capturedAuthToken = responseJson.token;
              }
            } catch (err) {
              // Ignore non-JSON authentication response bodies
            }
          }
        });

        const loginPg = new LoginPage(authBrowserPage);
        await loginPg.navigate();
        await loginPg.login(authUsername, authPassword);

        if (!capturedAuthToken) {
          capturedAuthToken = await authBrowserPage.evaluate(() => {
            return window.sessionStorage.getItem('token') || window.localStorage.getItem('token') || '';
          });
        }

        await activeBrowser.close();
      }
    });
  });

  test('Create and validate a Learning Instance via REST API', async ({ request }) => {
    expect(capturedAuthToken).not.toBe('');

    const authHeaders = {
      'x-authorization': capturedAuthToken,
      'content-type': 'application/json',
      'accept': 'application/json'
    };

    let targetDomainId = '';
    let targetLanguageId = '';
    let targetProviderId = '';
    let domainLangProviderId = '';
    let domainDetails = null;

    // Step 1: Fetch available cognitive domains to locate the default "Invoices" domain metadata
    await test.step('Step 1: Fetch Available Cognitive Domains and Locate "Invoices" Domain', async () => {
      const domainsApiResponse = await request.get(
        'https://community.cloud.automationanywhere.digital/cognitive/v3/domains',
        { headers: authHeaders }
      );
      expect(domainsApiResponse.status()).toBe(200);

      const allDomains = await domainsApiResponse.json();
      const invoiceDomainData = allDomains.find((domainItem) => domainItem.name === 'Invoices');
      expect(invoiceDomainData).toBeDefined();

      const langProvider = invoiceDomainData.languageProviders.find((lpItem) => lpItem.name === 'English');
      expect(langProvider).toBeDefined();
      
      const selectedProvider = langProvider.providers.find((providerItem) => providerItem.name === 'Automation Anywhere (Pre-trained)');
      expect(selectedProvider).toBeDefined();

      targetDomainId = invoiceDomainData.id;
      targetLanguageId = langProvider.languageId;
      targetProviderId = selectedProvider.id;
    });

    // Step 2: Retrieve domain field layout specs and domainLanguageProviderId
    let configuredFields = [];
    let configuredTables = [];

    await test.step('Step 2: Retrieve Domain Layout Specs and Map Target Field Payload', async () => {
      const detailsApiResponse = await request.get(
        `https://community.cloud.automationanywhere.digital/cognitive/v3/domains/${targetDomainId}?language=${targetLanguageId}&provider=${targetProviderId}`,
        { headers: authHeaders }
      );
      expect(detailsApiResponse.status()).toBe(200);

      domainDetails = await detailsApiResponse.json();
      domainLangProviderId = domainDetails.domainLanguageProviderId;
      expect(domainLangProviderId).toBeDefined();

      const transformDomainField = (rawField, shouldEnable) => ({
        name: rawField.name,
        displayName: rawField.displayName,
        dataType: rawField.dataType,
        featureType: rawField.featureType,
        confidenceThreshold: 0,
        defaultAliases: rawField.defaultAliases || [],
        domainObjectId: rawField.id,
        customAliases: [],
        description: '',
        isCustom: false,
        isRequired: rawField.isRequired || false,
        isEnabled: shouldEnable,
        domainVersion: '',
        isNormalizationEnabled: false,
        normalizationFormat: '',
        rules: [],
        useForExtraction: false,
        regexForExtraction: '',
        isFieldHeuristicFeedbackEnabled: true,
        searchQuery: rawField.searchQuery || {
          useSearchQuery: false,
          searchQueryValue: ''
        }
      });

      const targetFieldsToEnable = [
        'invoice_number',
        'invoice_date',
        'po_number',
        'receiver_address',
        'ship_to_address',
        'total_amount'
      ];
      const targetHeadersToEnable = [
        'description',
        'quantity',
        'unit_price',
        'total_price'
      ];

      const kvDomainObjects = domainDetails.domainObjects.filter((fieldItem) => fieldItem.featureType === 'KEY_VALUE');
      const headerDomainObjects = domainDetails.domainObjects.filter((fieldItem) => fieldItem.featureType === 'TABLE_HEADER');

      configuredFields = kvDomainObjects.map((fieldItem) => {
        const shouldEnable = targetFieldsToEnable.includes(fieldItem.name) || fieldItem.isEnabled === true;
        return transformDomainField(fieldItem, shouldEnable);
      });

      const configuredTableHeaders = headerDomainObjects.map((fieldItem) => {
        const shouldEnable = targetHeadersToEnable.includes(fieldItem.name) || fieldItem.isEnabled === true;
        return transformDomainField(fieldItem, shouldEnable);
      });

      configuredTables = [
        {
          name: 'table',
          description: '',
          tableHeaders: configuredTableHeaders
        }
      ];
    });

    // Step 3: Create the Learning Instance via REST API POST call
    const generatedInstanceName = `TestInstance_API_${Date.now()}`;
    let createdInstanceData = null;

    await test.step(`Step 3: Create Learning Instance via REST API (${generatedInstanceName})`, async () => {
      const startTimeMs = Date.now();
      const createInstanceResponse = await request.post(
        'https://community.cloud.automationanywhere.digital/cognitive/v3/learninginstances',
        {
          headers: authHeaders,
          data: {
            name: generatedInstanceName,
            description: 'Created via REST API Automation',
            domainId: targetDomainId,
            locale: 'en-US',
            isCloudExtraction: false,
            domainLanguageId: targetLanguageId,
            isHeuristicFeedbackEnabled: true,
            isGenAIEnabled: true,
            genaiProvider: 'Open_AI',
            modelConnectionId: '',
            modelConnectionName: '',
            selectedGenaiProvider: 'Open_AI',
            isDefault: true,
            useGenai: true,
            domainLanguageProviderId: domainLangProviderId,
            fields: configuredFields,
            tables: configuredTables,
            rules: domainDetails.rules || [],
            genaiFeature: domainDetails.genaiFeature || { tableFieldSupported: true }
          }
        }
      );
      const responseTimeMs = Date.now() - startTimeMs;

      if (createInstanceResponse.status() !== 200 && createInstanceResponse.status() !== 201) {
        console.error('CREATE INSTANCE ERROR:', await createInstanceResponse.text());
      }
      expect([200, 201]).toContain(createInstanceResponse.status());
      expect(responseTimeMs).toBeLessThan(15000);

      createdInstanceData = await createInstanceResponse.json();

      expect(createdInstanceData).toHaveProperty('id');
      expect(typeof createdInstanceData.id).toBe('string');
      expect(createdInstanceData.name).toBe(generatedInstanceName);
      expect(createdInstanceData.status).toBe('PRIVATE');
      expect(createdInstanceData.domain.id).toBe(targetDomainId);
      expect(createdInstanceData.domain.name).toBe('Invoices');
    });

    // Step 4: Verify the newly created instance appears in the instances list endpoint
    await test.step('Step 4: Verify Created Learning Instance Exists in List Endpoint', async () => {
      const listInstancesResponse = await request.post(
        'https://community.cloud.automationanywhere.digital/cognitive/v3/learninginstances/list',
        {
          headers: authHeaders,
          data: {
            filter: {
              operator: 'and',
              operands: []
            },
            sort: [],
            page: {
              offset: 0,
              length: 100
            }
          }
        }
      );
      expect(listInstancesResponse.status()).toBe(200);
      const listDataResult = await listInstancesResponse.json();
      const matchedInstance = listDataResult.list.find((instanceItem) => instanceItem.id.toLowerCase() === createdInstanceData.id.toLowerCase());
      expect(matchedInstance).toBeDefined();
      expect(matchedInstance.name).toBe(generatedInstanceName);
    });
  });
});
