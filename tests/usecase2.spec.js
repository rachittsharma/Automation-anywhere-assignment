import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage.js';

test.describe('Use Case 2: Learning Instance API Flow (API Automation)', () => {
  let capturedAuthToken = '';

  test.beforeAll(async ({ playwright }) => {
    const authUsername = process.env.AA_USER || 'rachitsharma920@gmail.com';
    const authPassword = process.env.AA_PASS || 'R@chit920';

    console.log('Authenticating via API (/v2/authentication) to capture secure token...');
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
        console.log(`Successfully authenticated via API! Token length: ${capturedAuthToken.length}`);
      }
    }

    // UI Fallback if direct API auth call requires browser context
    if (!capturedAuthToken) {
      console.log('Falling back to UI Page Object authentication to capture API token...');
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
      console.log(`UI fallback completed. Auth token length: ${capturedAuthToken.length}`);
    }
  });

  test('Create and validate a Learning Instance via REST API', async ({ request }) => {
    expect(capturedAuthToken).not.toBe('');

    const authHeaders = {
      'x-authorization': capturedAuthToken,
      'content-type': 'application/json',
      'accept': 'application/json'
    };

    // Step 2: Fetch available cognitive domains to locate the default "Invoices" domain metadata
    console.log('Fetching available domains...');
    const domainsApiResponse = await request.get(
      'https://community.cloud.automationanywhere.digital/cognitive/v3/domains',
      { headers: authHeaders }
    );
    expect(domainsApiResponse.status()).toBe(200);

    const allDomains = await domainsApiResponse.json();
    const invoiceDomainData = allDomains.find((domainItem) => domainItem.name === 'Invoices');
    expect(invoiceDomainData).toBeDefined();
    console.log(`Found Invoice Domain. ID: ${invoiceDomainData.id}`);

    // Extract default language (English) and provider (Automation Anywhere Pre-trained) metadata
    const langProvider = invoiceDomainData.languageProviders.find((lpItem) => lpItem.name === 'English');
    expect(langProvider).toBeDefined();
    
    const selectedProvider = langProvider.providers.find((providerItem) => providerItem.name === 'Automation Anywhere (Pre-trained)');
    expect(selectedProvider).toBeDefined();

    const targetDomainId = invoiceDomainData.id;
    const targetLanguageId = langProvider.languageId;
    const targetProviderId = selectedProvider.id;

    // Step 3: Retrieve domain field layout specs and domainLanguageProviderId
    console.log('Fetching specific domain details and language provider mapping...');
    const detailsApiResponse = await request.get(
      `https://community.cloud.automationanywhere.digital/cognitive/v3/domains/${targetDomainId}?language=${targetLanguageId}&provider=${targetProviderId}`,
      { headers: authHeaders }
    );
    expect(detailsApiResponse.status()).toBe(200);

    const domainDetails = await detailsApiResponse.json();
    const domainLangProviderId = domainDetails.domainLanguageProviderId;
    expect(domainLangProviderId).toBeDefined();
    console.log(`Retrieved domainLanguageProviderId: ${domainLangProviderId}`);

    // Transformation helper mapping raw domain objects into API creation payload structure
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

    // Filter key-value fields and table header fields from domain objects
    const kvDomainObjects = domainDetails.domainObjects.filter((fieldItem) => fieldItem.featureType === 'KEY_VALUE');
    const headerDomainObjects = domainDetails.domainObjects.filter((fieldItem) => fieldItem.featureType === 'TABLE_HEADER');

    const configuredFields = kvDomainObjects.map((fieldItem) => {
      const shouldEnable = targetFieldsToEnable.includes(fieldItem.name) || fieldItem.isEnabled === true;
      return transformDomainField(fieldItem, shouldEnable);
    });

    const configuredTableHeaders = headerDomainObjects.map((fieldItem) => {
      const shouldEnable = targetHeadersToEnable.includes(fieldItem.name) || fieldItem.isEnabled === true;
      return transformDomainField(fieldItem, shouldEnable);
    });

    const configuredTables = [
      {
        name: 'table',
        description: '',
        tableHeaders: configuredTableHeaders
      }
    ];

    // Step 4: Create the Learning Instance via REST API POST call
    const generatedInstanceName = `TestInstance_API_${Date.now()}`;
    console.log(`Creating Learning Instance: ${generatedInstanceName}...`);
    
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
    console.log(`Create Instance API Response Time: ${responseTimeMs}ms`);

    // Validate HTTP status code (200 OK or 201 Created) and API response time
    if (createInstanceResponse.status() !== 200 && createInstanceResponse.status() !== 201) {
      console.error('CREATE INSTANCE ERROR:', await createInstanceResponse.text());
    }
    expect([200, 201]).toContain(createInstanceResponse.status());
    expect(responseTimeMs).toBeLessThan(15000); // Response time performance threshold

    const createdInstanceData = await createInstanceResponse.json();

    // Field-level response schema assertions (id, name, status, domain data)
    expect(createdInstanceData).toHaveProperty('id');
    expect(typeof createdInstanceData.id).toBe('string');
    expect(createdInstanceData.name).toBe(generatedInstanceName);
    expect(createdInstanceData.status).toBe('PRIVATE');
    expect(createdInstanceData.domain.id).toBe(targetDomainId);
    expect(createdInstanceData.domain.name).toBe('Invoices');

    console.log(`Learning Instance successfully created! ID: ${createdInstanceData.id}`);

    // Step 5: Verify the newly created instance appears in the instances list endpoint
    console.log('Verifying the created instance exists in the list...');
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

    console.log('Use Case 2 API Test Completed Successfully!');
  });
});
