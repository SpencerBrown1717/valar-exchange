export interface DocSection {
  heading: string;
  body: string[];
  code?: string;
}

export interface DocPage {
  path: string;
  title: string;
  eyebrow: string;
  summary: string;
  sections: DocSection[];
  related?: { path: string; label: string }[];
}

export const docsPages: DocPage[] = [
  {
    path: '/docs',
    title: 'Build a clearer asset story.',
    eyebrow: 'Documentation',
    summary: 'A guide to the Valar Exchange preview, its illustrative examples, and the records that make a GPU fleet easier to review.',
    sections: [
      {
        heading: 'Start with the working preview',
        body: [
          'Explore three sample GPU fleets, change the GPU count, and move between Markets, Intelligence, and Reporting. The example updates in your browser. All asset records and dollar ranges are synthetic.',
          'You can download a sample asset report or prepare a local review brief. These actions create text files on your device; they do not submit an application or contact Valar Exchange.',
        ],
      },
      {
        heading: 'Understand the proposed workflow',
        body: [
          'The product concept connects fleet records, valuation evidence, financing preparation, and reporting. The documentation explains how those records could support a human review. A production asset platform, lender workflow, trading venue, and API are not available in this preview.',
          'Read the overview for the availability boundary, then use the quickstart to try every implemented product interaction.',
        ],
      },
      {
        heading: 'CLI documentation is a planning reference',
        body: [
          'The CLI pages describe possible future workflows. There is no Valar Exchange CLI to install, no login endpoint, and no command to execute. Each page points to the available browser action where one exists.',
        ],
      },
    ],
    related: [
      { path: '/docs/overview', label: 'Product overview' },
      { path: '/docs/quickstart', label: 'Try the preview' },
      { path: '/docs/cli', label: 'CLI availability' },
    ],
  },
  {
    path: '/docs/overview',
    title: 'A shared view of GPU assets.',
    eyebrow: 'Product overview',
    summary: 'Valar Exchange is a product preview for organizing the evidence behind a GPU fleet and presenting it for review.',
    sections: [
      {
        heading: 'Three views, one illustrative fleet',
        body: [
          'Markets presents a proposed asset-record workspace. Intelligence shows example valuation assumptions and evidence coverage. Reporting brings those assumptions and missing records into a downloadable sample.',
          'The hardware selector offers H100 SXM, H200 SXM, and A100 SXM scenarios. The GPU count ranges from 4 to 512. Choose 4 or 8 GPUs per node; the quantity step and node count follow that selection. The condition selector applies invented multipliers to the example range: new 1.1×, refurbished 1.0×, used 0.9×.',
        ],
      },
      {
        heading: 'What you can do today',
        body: [
          'Change the scenario, inspect the three views, preview and download a sample report, and download a review brief assembled from your own selections and notes.',
          'The website runs these interactions locally. It has no implemented asset uploads, account system, external data feed, API, order execution, loan application, payment, or custody service.',
        ],
      },
      {
        heading: 'How to interpret the examples',
        body: [
          'Example identifiers, ages, conditions, record coverage, and value ranges are invented to demonstrate the interface. They are not current prices, verified assets, appraisals, offers, or executed transactions.',
          'Actual asset and financing decisions require verified information and review by the relevant qualified parties. Nothing in the preview establishes eligibility, approval, a lender relationship, or regulatory status.',
        ],
      },
    ],
    related: [
      { path: '/docs/quickstart', label: 'Preview quickstart' },
      { path: '/docs/valuation-evidence', label: 'Read valuation assumptions' },
      { path: '/docs/security', label: 'Data and privacy' },
    ],
  },
  {
    path: '/docs/quickstart',
    title: 'Explore a fleet in a few steps.',
    eyebrow: 'Quickstart',
    summary: 'Try the available browser preview without an account, an installation, or an external submission.',
    sections: [
      {
        heading: '1. Select a scenario',
        body: [
          'Open the product preview and select H100, H200, or A100 hardware. Adjust the GPU count with the minus and plus buttons or enter a number. The demo rounds counts to a multiple of the selected node size and keeps them between the selected node size and 512.',
          'The range shown for a fleet equals the selected GPU count multiplied by the synthetic per-GPU assumptions. Changing the count does not retrieve a quote.',
        ],
      },
      {
        heading: '2. Compare the views',
        body: [
          'Select Markets to inspect the example asset record, Intelligence to examine its assumed range and evidence, or Reporting to review its package. Your hardware and count selections carry across these views.',
          'With the keyboard, Tab into the product tabs and use Left or Right to move between them. Home selects the first tab and End selects the last. The hardware selector and quantity controls also work with the keyboard.',
        ],
      },
      {
        heading: '3. Save a sample or a brief',
        body: [
          'Open the sample report and use its download action to save a TXT file for the current scenario. The file includes the assumptions, evidence checklist, and an explanation that every figure is illustrative.',
          'Open the review brief, choose a purpose and hardware, enter a GPU count, and optionally add notes. Its download action saves a separate TXT file. The brief is not submitted to Valar Exchange or any third party. Escape closes an open dialog and returns focus to the control that opened it.',
        ],
      },
    ],
    related: [
      { path: '/docs/reporting', label: 'Report contents' },
      { path: '/docs/financing-readiness', label: 'Prepare a review brief' },
      { path: '/docs/security', label: 'Local data handling' },
    ],
  },
  {
    path: '/docs/asset-records',
    title: 'Make the fleet legible.',
    eyebrow: 'Asset records',
    summary: 'A proposed record structure for connecting hardware, ownership, configuration, and condition to a reviewable asset.',
    sections: [
      {
        heading: 'The record shown in the preview',
        body: [
          'Each sample identifies a GPU model and memory configuration, an example fleet reference, a GPU and node count, and assumed condition and age. Model, memory, age, and evidence coverage come from synthetic scenarios. You can change the GPU quantity, select 4 or 8 GPUs per node, and choose an assumed condition.',
          'The preview does not look up serial numbers, validate ownership, inspect a device, or ingest a real fleet. There is no upload or persistent asset register.',
        ],
        code: JSON.stringify({status: 'illustrative', records: [{name: 'H100 SXM', memory: '80 GB', code: 'VE–014', units: 64, nodeSize: 8, nodes: 8, condition: 'Documented use', low: 18000, high: 24000, evidence: 6, total: 8, coverage: 75}]}, null, 2),
      },
      {
        heading: 'Evidence to organize for a real review',
        body: [
          'A useful review package could include purchase and ownership records, device identifiers, configuration details, condition assessments, utilization history, warranty terms, and insurance records.',
          'Keep the origin, date, scope, and responsible party alongside each record. Separate a reported fact from an assumption, and mark missing or outdated information explicitly. Valar Exchange does not verify these records in the current preview.',
        ],
      },
      {
        heading: 'Coverage is not a verification score',
        body: [
          'The sample counts attached example records across eight checklist categories. Its coverage percentage is that count divided by eight, rounded to a whole percent.',
          'An attached document can still be incomplete, inconsistent, or unsuitable for a particular review. The demonstration count does not establish provenance, legal ownership, financial quality, or financing eligibility.',
        ],
      },
    ],
    related: [
      { path: '/docs/valuation-evidence', label: 'Connect records to assumptions' },
      { path: '/docs/reporting', label: 'Package the example' },
    ],
  },
  {
    path: '/docs/valuation-evidence',
    title: 'Keep the assumptions visible.',
    eyebrow: 'Valuation evidence',
    summary: 'The Intelligence preview demonstrates a range with context. It does not provide a market price or an appraisal.',
    sections: [
      {
        heading: 'How the sample range is calculated',
        body: [
          'Each hardware scenario starts with invented lower and upper values per GPU. The condition selector applies synthetic multipliers: new 1.1×, refurbished 1.0×, used 0.9×. The preview then multiplies the adjusted per-unit range by the GPU count. These factors demonstrate interface behavior and are not market estimates.',
          'The model contains no live market feed, transaction comparables, depreciation model, performance measurements, currency conversion, or dynamic pricing service. Its simple arithmetic is intended to show the proposed interface.',
        ],
      },
      {
        heading: 'What a defensible review would need',
        body: [
          'For a real review, collect dated sources for comparable assets, the asset configuration and condition, ownership evidence, and the assumptions behind adjustments. Distinguish an asking price from a completed transaction and record the source of each claim.',
          'Document uncertainty and the purpose of the review. A value for one configuration, location, condition, or transaction structure may not transfer to another. This website neither performs that analysis nor certifies a result.',
        ],
      },
      {
        heading: 'Carry context into the report',
        body: [
          'The sample TXT report includes the per-GPU range, fleet range, condition and age assumptions, evidence coverage, and method. Its explicit synthetic-data notice remains in the downloaded file.',
          'Use the sample to evaluate presentation and workflow. Do not use its numbers for an asset purchase, collateral decision, financial statement, trade, or investment.',
        ],
      },
    ],
    related: [
      { path: '/docs/asset-records', label: 'Asset evidence checklist' },
      { path: '/docs/reporting', label: 'Sample report' },
    ],
  },
  {
    path: '/docs/financing-readiness',
    title: 'Prepare the questions before the review.',
    eyebrow: 'Financing readiness',
    summary: 'A local planning brief helps organize a discussion. It does not assess eligibility or apply for financing.',
    sections: [
      {
        heading: 'Create a local review brief',
        body: [
          'The brief dialog collects your review focus, hardware, GPU count, and optional questions. Its download action creates valar-exchange-review-brief.txt on your device.',
          'The file also lists suggested evidence to organize: ownership and purchase records, identifiers and configuration, condition and utilization history, dated valuation sources, and warranty and insurance records.',
        ],
      },
      {
        heading: 'What the brief does not do',
        body: [
          'No brief is sent to Valar Exchange, a lender, or another party. The website does not assess credit, verify collateral, match lenders, generate loan terms, make a financing offer, accept an application, or take a payment.',
          'Any future financing workflow would require a separately implemented service, appropriate agreements, permissions, and review. A product concept is not evidence of lender participation or approval.',
        ],
      },
      {
        heading: 'Keep the next discussion specific',
        body: [
          'Use your notes to identify missing records, the intended review purpose, and questions for the people who will evaluate the fleet. Avoid including confidential identifiers or personal financial information in this public preview.',
          'A download is plain text. If you choose to share it later, review its contents and use a channel appropriate for the information. There is no sharing or email action in the preview.',
        ],
      },
    ],
    related: [
      { path: '/docs/asset-records', label: 'Organize asset records' },
      { path: '/docs/security', label: 'Brief privacy' },
    ],
  },
  {
    path: '/docs/reporting',
    title: 'A portable view of the example.',
    eyebrow: 'Reporting',
    summary: 'Download the current illustrative fleet scenario as a readable TXT file, with assumptions and missing evidence included.',
    sections: [
      {
        heading: 'What the sample report contains',
        body: [
          'The report includes the example fleet reference, model and memory, GPU and node count, condition and age assumptions, per-GPU range, fleet range, and evidence coverage.',
          'Eight checklist categories appear as attached or missing in the example. The report includes the calculation method, synthetic-data notice, and a statement that it creates no trade, loan, payment, custody, or external submission.',
        ],
      },
      {
        heading: 'Preview, then download',
        body: [
          'Select your hardware and GPU count before opening the sample report. The dialog shows the corresponding text. The download action saves valar-exchange-sample-report.txt.',
          'The download is generated in your browser. There is no report API, scheduled delivery, email, spreadsheet integration, PDF export, or financial reporting system behind the preview.',
        ],
      },
      {
        heading: 'Use the file within its limits',
        body: [
          'The sample is a demonstration of report structure. It is not an audit, appraisal, financial statement, investment recommendation, or lender-approved package.',
          'Real reporting would need verified records, dated assumptions, a defined reporting purpose, and the appropriate human review. The preview does not make accounting determinations or attest to asset values.',
        ],
      },
    ],
    related: [
      { path: '/docs/quickstart', label: 'Download walkthrough' },
      { path: '/docs/valuation-evidence', label: 'Understand the range' },
    ],
  },
  {
    path: '/docs/security',
    title: 'Know where your information goes.',
    eyebrow: 'Data and privacy',
    summary: 'The preview has local browser interactions and device downloads. It has no implemented account, submission, or asset-storage service.',
    sections: [
      {
        heading: 'Form data stays in the current page',
        body: [
          'The review-brief fields are handled in your browser. The implemented application does not transmit them to Valar Exchange or a third party and does not save them to a server, localStorage, or sessionStorage.',
          'Fields may remain in the current page while you use it, including after closing the dialog. The site provides no saved account or cross-device recovery. Browser autofill, download handling, and any browser-managed restoration follow your own browser settings.',
        ],
      },
      {
        heading: 'Downloads are plain-text files',
        body: [
          'Reports and briefs are created as TXT downloads on your device. A review brief contains the selections and notes you enter. These files are not encrypted by the website and remain subject to your device, browser, backup, and sharing settings.',
          'Use synthetic or nonconfidential information in this preview. Review downloaded files before sharing them. Closing the page does not delete a file you downloaded.',
        ],
      },
      {
        heading: 'Website delivery is separate from a submission',
        body: [
          'Your browser requests website files from the host when loading the site. The application includes no analytics, tracking code, email sender, account authentication, payment processor, or background data API.',
          'The local form statement does not make a claim about the hosting provider’s ordinary access logs or your network and browser. The preview has no implemented service for uploading sensitive asset or financial records.',
        ],
      },
    ],
    related: [
      { path: '/docs/overview', label: 'Available functionality' },
      { path: '/docs/financing-readiness', label: 'Local review brief' },
    ],
  },
  {
    path: '/docs/changelog',
    title: 'Preview release notes.',
    eyebrow: 'Changelog',
    summary: 'A record of the capabilities included in this website preview.',
    sections: [
      {
        heading: 'Website preview · 0.1',
        body: [
          'Valar Exchange branding, responsive navigation, original product explanations, and public documentation introduce the proposed GPU-asset workflow.',
          'The browser demonstration includes synthetic H100, H200, and A100 scenarios; GPU counts from 4 to 512 with 4 or 8 GPUs per node; Markets, Intelligence, and Reporting views; a sample TXT report; and a local TXT review brief.',
        ],
      },
      {
        heading: 'Interaction and accessibility',
        body: [
          'The product tabs support arrow keys, Home, and End. Native dialogs support Escape and return focus to their opening control. The mobile navigation provides an expanded state and an Escape action.',
          'These notes describe the implemented website behavior. They do not certify accessibility conformance or announce the availability of a production financial service.',
        ],
      },
      {
        heading: 'Still a proposed product',
        body: [
          'Accounts, CLI, asset uploads, verification, live valuation data, financing applications, trading, payments, integrations, and APIs are unavailable. The CLI documentation records planning concepts only.',
          'Future functionality and launch dates have not been committed in this preview.',
        ],
      },
    ],
    related: [
      { path: '/docs/overview', label: 'Preview boundaries' },
      { path: '/docs/cli', label: 'CLI status' },
    ],
  },
  {
    path: '/docs/cli',
    title: 'CLI · planned, unavailable.',
    eyebrow: 'Planned developer tools',
    summary: 'A possible command-line workflow for asset records and reports. There is no Valar Exchange CLI to install or use today.',
    sections: [
      {
        heading: 'Availability',
        body: [
          'No CLI package, binary, authentication endpoint, API, or developer credential is available in this preview. There are no supported install commands. Do not enter account credentials into a tool claiming to connect to this website.',
        ],
      },
      {
        heading: 'The proposed scope',
        body: [
          'A future tool could help authorized users organize asset records, check missing evidence, and export a review package. The design would need a defined data contract, access controls, consent, and a separately implemented backend.',
          'The login, request-file, commands, and agents pages describe these planning topics. Their route names do not imply that matching commands or services exist.',
        ],
      },
      {
        heading: 'Available browser alternative',
        body: [
          'Use the website’s sample report for an illustrative fleet export or its review brief for a local planning file. Both are TXT downloads generated in your browser without authentication.',
        ],
      },
    ],
    related: [
      { path: '/docs/cli/login', label: 'Authentication status' },
      { path: '/docs/cli/commands', label: 'Command status' },
      { path: '/docs/quickstart', label: 'Working browser preview' },
    ],
  },
  {
    path: '/docs/cli/login',
    title: 'CLI login · unavailable.',
    eyebrow: 'Planned CLI · authentication',
    summary: 'Valar Exchange has no CLI login, account service, or API credential in the current preview.',
    sections: [
      {
        heading: 'No credentials are required',
        body: [
          'The website demonstration works without a user account. There is no supported login command, token request, device authorization flow, or credential configuration.',
          'No button in this preview authorizes access to an asset platform or financial service. Do not paste passwords, private keys, or access tokens into the review brief.',
        ],
      },
      {
        heading: 'What a future login would need',
        body: [
          'Any future account or CLI authentication would require a separately implemented identity service, explicit access scopes, credential handling, revocation, and a clear privacy policy. These are requirements for future design, not implemented protections.',
          'No release date or identity provider is announced here.',
        ],
      },
    ],
    related: [
      { path: '/docs/cli', label: 'CLI availability' },
      { path: '/docs/security', label: 'Current data handling' },
    ],
  },
  {
    path: '/docs/cli/request-file',
    title: 'Request files · planned format.',
    eyebrow: 'Planned CLI · request files',
    summary: 'There is no CLI request-file parser or accepted machine-readable request format. The browser can create a local planning brief today.',
    sections: [
      {
        heading: 'What exists today',
        body: [
          'The review-brief dialog downloads a human-readable TXT file with your review focus, hardware, GPU count, notes, and an evidence checklist. It is a planning artifact on your device.',
          'The file is not uploaded, executed, validated by a service, or interpreted as a financing application, order, or API request.',
        ],
      },
      {
        heading: 'What remains undefined',
        body: [
          'A future machine-readable format would need a versioned schema, supported field definitions, validation rules, permissions, and an explicit submission contract. None is available in this preview.',
          'There is no supported JSON or YAML template and no request-file command to run. Renaming a downloaded brief does not make it a supported API input.',
        ],
      },
    ],
    related: [
      { path: '/docs/financing-readiness', label: 'Create a local brief' },
      { path: '/docs/cli/commands', label: 'Command availability' },
    ],
  },
  {
    path: '/docs/cli/commands',
    title: 'Commands · no executable interface.',
    eyebrow: 'Planned CLI · commands',
    summary: 'No Valar Exchange commands are implemented. Use the browser preview for the available interactions.',
    sections: [
      {
        heading: 'Available actions and their location',
        body: [
          'Choose hardware and GPU count in the product preview. Switch between Markets, Intelligence, and Reporting with the tab controls. Open the sample report to inspect and download the current illustrative scenario.',
          'Open the review brief to create a local TXT planning file. These browser actions do not have command-line equivalents in this release.',
        ],
      },
      {
        heading: 'No supported command syntax',
        body: [
          'There are no supported install, login, asset import, valuation, report, trade, or financing commands. This documentation intentionally provides no executable examples for unavailable services.',
          'A future CLI specification would document prerequisites, inputs, outputs, errors, and authorization before asking users to run a command. Its design and release date are not established.',
        ],
      },
    ],
    related: [
      { path: '/docs/quickstart', label: 'Browser action walkthrough' },
      { path: '/docs/cli', label: 'CLI overview' },
    ],
  },
  {
    path: '/docs/cli/agents',
    title: 'Agent integration · unavailable.',
    eyebrow: 'Planned CLI · agents',
    summary: 'The website has no agent connector, MCP server, programmable API, or delegated-action service.',
    sections: [
      {
        heading: 'No autonomous financial actions',
        body: [
          'An agent cannot authenticate, import a fleet, request a valuation, submit financing, place an order, or initiate a payment through this preview. There are no exposed credentials, endpoints, or executable tools for those actions.',
          'The demonstration does not delegate authority over an asset, account, transaction, or financial decision.',
        ],
      },
      {
        heading: 'A proposed assistive role',
        body: [
          'A future integration could assist with organizing records, identifying missing information, and drafting a review package. Any such integration would need explicit user permissions, bounded access, traceable sources, and human review before consequential actions.',
          'This is a design direction only. It is not an announced capability or an implemented control system.',
        ],
      },
      {
        heading: 'Use current artifacts carefully',
        body: [
          'You can independently review the sample report or local brief with tools you choose. Check their privacy settings before sharing a file and preserve the sample report’s synthetic-data notice.',
          'Valar Exchange does not send files to an external model or service in this preview.',
        ],
      },
    ],
    related: [
      { path: '/docs/cli', label: 'Developer tool status' },
      { path: '/docs/security', label: 'Data and downloads' },
    ],
  },
];
