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
    title: 'Explore GPU deals with context.',
    eyebrow: 'Documentation',
    summary: 'A guide to GPU deal discovery, GPU-IQ market intelligence, and investment-access previews at Valar Exchange. Every deal and amount in the demonstration is fictional.',
    sections: [
      {
        heading: 'Start with deal discovery',
        body: [
          'Browse three fictional GPU deal profiles in Markets. Search the sample records, filter by hardware, region, and strategy, and compare their assumed budgets and document coverage. Open a profile to inspect its scenario and missing information.',
          'GPU-IQ at /intelligence offers a public sample overview and an expandable Premium preview with deeper comparisons, hardware and region filters, a local fictional CSV export, and a research-brief preview. Original research notes remain public. None of these pages contains verified deals, actual market activity, or an investment offering.',
          'The investment-access preview creates a local planning file for a selected sample deal. It does not create an account, submit an application, reserve an allocation, or contact Valar Exchange.',
        ],
      },
      {
        heading: 'Understand the proposed workflow',
        body: [
          'The product concept brings deal discovery, GPU market research, and a possible future investment-access workflow together. Supporting fleet tools demonstrate asset records, valuation assumptions, financing preparation, and reporting.',
          'Read the overview for the availability boundary, then use the quickstart to try the implemented controls. The public Premium preview demonstrates a proposed product tier; it has no secure paywall, subscription, account, billing, or purchase flow. Real offerings, payments, trading, lending, and APIs are unavailable.',
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
      { path: '/docs/deal-discovery', label: 'Browse fictional deals' },
      { path: '/docs/gpu-iq', label: 'GPU-IQ overview and Premium preview' },
      { path: '/docs/investment-access', label: 'Investment-access boundaries' },
      { path: '/docs/cli', label: 'CLI availability' },
    ],
  },
  {
    path: '/docs/overview',
    title: 'A financial lens on GPU deals.',
    eyebrow: 'Product overview',
    summary: 'Valar Exchange previews a financial destination for GPU deal discovery, GPU-IQ market intelligence, and investment access. Its current records are entirely fictional.',
    sections: [
      {
        heading: 'Discover, research, and prepare',
        body: [
          'Markets lets you browse three invented GPU deal profiles across hardware, region, and strategy. Detail pages bring the assumed fleet, budget, scenario, and evidence gaps into one view. They do not describe available securities, real assets for sale, or verified counterparties.',
          'GPU-IQ summarizes the sample records in a free public overview. Its expandable Premium preview demonstrates deeper comparisons, hardware and region filters, a local fictional CSV export, and a research-brief preview. Original research notes remain public.',
          'The Premium preview can be tried publicly and has no secure paywall, price, subscription, account, billing, or checkout. The investment-access page demonstrates preparing a local brief for a selected fictional deal; it does not enroll an investor or accept a financial commitment.',
        ],
      },
      {
        heading: 'Supporting fleet tools',
        body: [
          'Markets presents a proposed asset-record workspace. Intelligence shows example valuation assumptions and evidence coverage. Reporting brings those assumptions and missing records into a downloadable sample.',
          'The hardware selector offers H100 SXM, H200 SXM, and A100 SXM scenarios. The GPU count ranges from 4 to 512. Choose 4 or 8 GPUs per node; the quantity step and node count follow that selection. The condition selector applies invented multipliers to the example range: new 1.1×, refurbished 1.0×, used 0.9×.',
        ],
      },
      {
        heading: 'What you can do today',
        body: [
          'Search, filter, and sort fictional deals; open their profiles; inspect free GPU-IQ summaries; expand the GPU-IQ Premium preview; compare filtered samples; save a local fictional CSV; inspect a research brief; and create a local investment-access planning brief. You can also change a fleet scenario, inspect its three views, preview and download a sample report, and save a fleet review brief.',
          'The website runs these interactions locally. It has no implemented asset uploads, account system, external data feed, API, order execution, loan application, payment, or custody service.',
        ],
      },
      {
        heading: 'How to interpret the examples',
        body: [
          'Deal profiles, budgets, fleet identifiers, ages, conditions, record coverage, and value ranges are invented to demonstrate the interface. They are not current prices, verified assets, appraisals, offerings, investment returns, or executed transactions.',
          'Actual asset and financing decisions require verified information and review by the relevant qualified parties. Nothing in the preview establishes eligibility, approval, a lender relationship, or regulatory status.',
        ],
      },
    ],
    related: [
      { path: '/docs/quickstart', label: 'Preview quickstart' },
      { path: '/docs/deal-discovery', label: 'Deal discovery controls' },
      { path: '/docs/gpu-iq', label: 'Free overview and Premium preview' },
      { path: '/docs/investment-access', label: 'Investment-access preview' },
      { path: '/docs/valuation-evidence', label: 'Read valuation assumptions' },
      { path: '/docs/security', label: 'Data and privacy' },
    ],
  },
  {
    path: '/docs/quickstart',
    title: 'Explore the preview in a few steps.',
    eyebrow: 'Quickstart',
    summary: 'Try the available browser preview without an account, an installation, or an external submission.',
    sections: [
      {
        heading: '1. Browse and open a fictional deal',
        body: [
          'Open Markets at /marketplace. Use search and the hardware, region, and strategy filters to narrow the three sample profiles. Change the sort order to compare document coverage or assumed budget. Clearing the controls returns to the full example set.',
          'Open a deal profile to review its assumed GPU fleet, scenario, budget, and evidence gaps. The fictional-data label applies to every field, including descriptions and document statuses. These profiles are interface examples, not investments available to purchase.',
        ],
      },
      {
        heading: '2. Explore GPU-IQ and research context',
        body: [
          'Open GPU-IQ at /intelligence to inspect the free sample overview. Expand the GPU-IQ Premium preview, compare the fictional records, and try the hardware and region filters. The Premium preview opens publicly without authentication, subscription, or payment.',
          'Save a local fictional CSV or inspect the research-brief preview to evaluate the proposed workflow. Counts and amounts describe the selected sample records only; they do not measure the GPU market or establish demand, performance, or returns. No live or proprietary dataset is connected.',
          'Follow the research links for original notes on asset records, assumptions, and review readiness. Research notes are explanatory material, not recommendations to invest in any sample deal.',
        ],
      },
      {
        heading: '3. Try investment access locally',
        body: [
          'Follow a deal profile’s investment-access preview to /marketplace/signup. Select the sample deal you want to examine and prepare a local brief. The download saves a planning file on your device; no request is sent.',
          'No financial account, investor status, allocation, agreement, payment, or ownership interest is created. Use nonconfidential information and keep the fictional-data notice with any file you share independently.',
        ],
      },
      {
        heading: '4. Select a fleet scenario',
        body: [
          'Open the product preview and select H100, H200, or A100 hardware. Adjust the GPU count with the minus and plus buttons or enter a number. The demo rounds counts to a multiple of the selected node size and keeps them between the selected node size and 512.',
          'The range shown for a fleet equals the selected GPU count multiplied by the synthetic per-GPU assumptions. Changing the count does not retrieve a quote.',
        ],
      },
      {
        heading: '5. Compare the fleet views',
        body: [
          'Select Markets to inspect the example asset record, Intelligence to examine its assumed range and evidence, or Reporting to review its package. Your hardware and count selections carry across these views.',
          'With the keyboard, Tab into the product tabs and use Left or Right to move between them. Home selects the first tab and End selects the last. The hardware selector and quantity controls also work with the keyboard.',
        ],
      },
      {
        heading: '6. Save a fleet sample or a brief',
        body: [
          'Open the sample report and use its download action to save a TXT file for the current scenario. The file includes the assumptions, evidence checklist, and an explanation that every figure is illustrative.',
          'Open the review brief, choose a purpose and hardware, enter a GPU count, and optionally add notes. Its download action saves a separate TXT file. The brief is not submitted to Valar Exchange or any third party. Escape closes an open dialog and returns focus to the control that opened it.',
        ],
      },
    ],
    related: [
      { path: '/marketplace', label: 'Open deal discovery' },
      { path: '/docs/deal-discovery', label: 'Discovery controls and data' },
      { path: '/docs/gpu-iq', label: 'GPU-IQ preview walkthrough' },
      { path: '/docs/investment-access', label: 'Local investment-access brief' },
      { path: '/docs/reporting', label: 'Report contents' },
      { path: '/docs/financing-readiness', label: 'Prepare a review brief' },
      { path: '/docs/security', label: 'Local data handling' },
    ],
  },
  {
    path: '/docs/deal-discovery',
    title: 'Discover the scenario. Inspect the evidence.',
    eyebrow: 'Deal discovery',
    summary: 'Markets is a working browser demonstration with three fictional GPU deal profiles. No real offerings or verified counterparties are listed.',
    sections: [
      {
        heading: 'The three fictional profiles',
        body: [
          'valar-001 describes a sample compute-infrastructure scenario with 64 H100 GPUs in North America. valar-002 describes 128 H200 GPUs in Europe. valar-003 describes a hardware-resale scenario with 96 A100 GPUs in Asia Pacific.',
          'These identifiers, locations, quantities, descriptions, budgets, and evidence statuses are invented. The records do not correspond to verified projects, owners, operators, investment vehicles, or assets available for acquisition.',
        ],
      },
      {
        heading: 'Search, filter, and sort',
        body: [
          'Search the sample profiles and combine hardware, region, and strategy filters to narrow the results. Use the sort control to compare assumed budgets or document coverage. A result count refers only to the matching fictional records in this demonstration.',
          'The controls run against the bundled sample records in your browser. They do not query an external database or discover new deals. A missing result means the filters exclude the demonstration records, not that a real market has no activity.',
        ],
      },
      {
        heading: 'Read a detail page within its limits',
        body: [
          'Each profile presents the proposed scenario and the information a reviewer would want to examine. An assumed budget demonstrates a comparison field; it is not a valuation, capital commitment, minimum investment, subscription price, or financing term.',
          'Document coverage indicates how many example checklist items the fictional record includes. It does not verify ownership, document authenticity, project viability, financial quality, or investor eligibility. Missing inputs remain visible so the next questions are concrete.',
        ],
      },
      {
        heading: 'Continue to research or an access preview',
        body: [
          'Compare the same sample records in GPU-IQ and read the linked original research notes. The free overview is public, as are the sample deal profiles and research notes. The expandable Premium preview demonstrates deeper analysis using the same invented fixtures.',
          'Those materials help explain the interface and review questions; they do not recommend a deal or report live market performance. The publicly accessible Premium demonstration has no secure paywall or subscription.',
          'An investment-access action opens a local planning preview. It does not reserve a deal, submit an investor application, execute a transaction, or enter a binding agreement.',
        ],
      },
    ],
    related: [
      { path: '/marketplace', label: 'Browse fictional profiles' },
      { path: '/intelligence', label: 'GPU-IQ sample overview' },
      { path: '/docs/gpu-iq', label: 'GPU-IQ Premium preview boundaries' },
      { path: '/docs/investment-access', label: 'Understand the access preview' },
      { path: '/docs/asset-records', label: 'Supporting asset records' },
    ],
  },
  {
    path: '/docs/gpu-iq',
    title: 'GPU-IQ. Intelligence with context.',
    eyebrow: 'GPU-IQ market intelligence',
    summary: 'Explore a free sample overview and a public GPU-IQ Premium preview. Every record, amount, and document status is fictional; no live or proprietary dataset is connected.',
    sections: [
      {
        heading: 'The free public overview',
        body: [
          'GPU-IQ at /intelligence presents a basic summary of the three fictional GPU deal profiles. Counts, hardware mix, locations, budgets, and evidence coverage describe this demonstration set only. They are not estimates of the overall GPU market.',
          'The basic deal profiles and original research notes are also public. No account or subscription is needed to read them. Their availability does not make the records verified or the profiles investable.',
        ],
      },
      {
        heading: 'Expand the GPU-IQ Premium preview',
        body: [
          'Expand the Premium preview on the same page to compare sample profiles in more detail and narrow them with hardware and region filters. The comparisons retain assumed budgets, fictional document statuses, and missing inputs so you can inspect what a future research workflow might show.',
          'The expandable preview is publicly accessible. Premium names a proposed product tier, not an operating paid service or a secure paywall. There are no prices, subscription agreements, authentication, billing, or checkout in this release.',
        ],
      },
      {
        heading: 'Evaluate the sample output',
        body: [
          'The CSV action creates a local file from fictional records in your browser. Preserve its fictional-data labels when reviewing or independently sharing it. A sample export is not a licensed dataset, market feed, verified transaction record, investment recommendation, or performance report.',
          'The research-brief preview organizes review questions around the sample records and their missing evidence. Its content is an original demonstration, with no claim of proprietary research, verified sources, or predicted investment returns. Public research notes remain available separately.',
        ],
      },
      {
        heading: 'An interest brief is local',
        body: [
          'The page at /intelligence/signup lets you prepare a local interest brief. Its download action saves a planning file on your device. It does not send a subscription request, enroll you in a service, add you to a mailing list, or create an account.',
          'A future operating GPU-IQ service would require defined data sources and permissions, appropriate review, a separate product release, and its own account and commercial terms where applicable. None is asserted by this preview.',
        ],
      },
    ],
    related: [
      { path: '/intelligence', label: 'Open GPU-IQ' },
      { path: '/intelligence/signup', label: 'Local GPU-IQ interest brief' },
      { path: '/research', label: 'Public original research notes' },
      { path: '/docs/deal-discovery', label: 'Fictional deal records' },
      { path: '/docs/security', label: 'Local data and downloads' },
    ],
  },
  {
    path: '/docs/investment-access',
    title: 'Investment access starts as a preview.',
    eyebrow: 'Investment-access preview',
    summary: 'Prepare a local planning brief for a fictional GPU deal. No offering, account, financial commitment, or external submission is created.',
    sections: [
      {
        heading: 'Choose a sample deal and prepare a brief',
        body: [
          'The investment-access page at /marketplace/signup lets you select a fictional deal and record the review questions you want to explore. Arriving from a deal profile may carry that sample selection into the page; review the selected profile before saving.',
          'The form’s download action creates a local planning file on your device. It keeps the selected fictional deal and the preview boundaries with your notes. It is not delivered to Valar Exchange, an operator, a fund, or another party.',
        ],
      },
      {
        heading: 'No financial action is available',
        body: [
          'This preview cannot open an investment or financial account, verify identity, assess investor eligibility, accept a subscription, reserve an allocation, collect money, calculate investment returns, or grant an ownership interest.',
          'The sample profiles are not securities offerings or invitations to enter a real transaction. Preparing a brief does not accept terms, sign an agreement, apply for financing, or commit either you or Valar Exchange to a future service.',
        ],
      },
      {
        heading: 'Use nonconfidential information',
        body: [
          'Use the page to evaluate the proposed workflow. Do not enter identity documents, financial account details, credentials, or confidential investment information. The current application handles the form locally and has no implemented submission or account service.',
          'Downloaded files are plain text and remain under your device and browser settings. Review the contents before any independent sharing. The preview does not send email or provide a sharing service.',
        ],
      },
      {
        heading: 'A future operating service needs a separate release',
        body: [
          'Real investment access would need an explicitly defined legal and product scope, verified counterparties and information, appropriate eligibility and compliance review, and separately implemented account, agreement, and payment systems.',
          'Those requirements describe future work. This website does not assert regulatory authorization, institutional participation, an available investment program, or a committed launch date.',
        ],
      },
    ],
    related: [
      { path: '/marketplace/signup', label: 'Open the local access preview' },
      { path: '/docs/deal-discovery', label: 'Fictional deal records' },
      { path: '/docs/security', label: 'Data and download handling' },
      { path: '/terms', label: 'Preview use terms' },
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
    summary: 'The fleet valuation tool demonstrates a range with context. GPU-IQ summaries use separate fictional deal records; neither provides live market data, a market price, or an appraisal.',
    sections: [
      {
        heading: 'Keep deal intelligence separate from fleet arithmetic',
        body: [
          'GPU-IQ groups selected fictional deal profiles by region and hardware. Its record counts, GPU totals, assumed budgets, and document coverage describe that sample set only. The Premium preview lets you compare and export those same invented fixtures. These outputs are not market-share observations, transaction history, fundraising activity, performance statistics, or verified data.',
          'The fleet calculator below uses a separate set of invented per-GPU values to demonstrate a valuation interface. A profile’s assumed budget is not derived from this calculator and is not an asset price or investment term.',
        ],
      },
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
      { path: '/docs/deal-discovery', label: 'Interpret deal intelligence' },
      { path: '/docs/gpu-iq', label: 'GPU-IQ sample data boundaries' },
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
    summary: 'Deal discovery, GPU-IQ previews, investment-access planning, and fleet tools run in the browser. Downloads stay on your device. There is no implemented account, submission, or asset-storage service.',
    sections: [
      {
        heading: 'Form data stays in the current page',
        body: [
          'The investment-access planning fields, GPU-IQ interest-brief fields, and fleet review-brief fields are handled in your browser. The implemented application does not transmit them to Valar Exchange or a third party and does not save them to a server, localStorage, or sessionStorage.',
          'Fields may remain in the current page while you use it, including after closing the dialog. The site provides no saved account or cross-device recovery. Browser autofill, download handling, and any browser-managed restoration follow your own browser settings.',
        ],
      },
      {
        heading: 'Downloads are plain-text files',
        body: [
          'Reports and briefs are created as TXT downloads on your device. An investment-access, GPU-IQ interest, or fleet review brief contains the selections and notes you enter. GPU-IQ also creates a local CSV with fictional records. These files are not encrypted by the website and remain subject to your device, browser, backup, and sharing settings.',
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
      { path: '/docs/gpu-iq', label: 'GPU-IQ outputs and availability' },
      { path: '/docs/investment-access', label: 'Local investment-access preview' },
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
        heading: 'Deal discovery and intelligence preview',
        body: [
          'Markets includes three fictional GPU deal profiles with search, hardware, region, and strategy filters and assumed-budget or document-coverage sorting. Detail pages explain the sample scenario and its missing evidence.',
          'GPU-IQ includes a free public sample overview and an expandable Premium preview with deeper comparisons, hardware and region filters, a local fictional CSV export, and a research-brief preview. It has no secure paywall, paid subscription, account, or billing. Original research notes remain public.',
          'The investment-access preview prepares a local planning file for a selected sample deal. The GPU-IQ interest page also creates only a local brief. No real offerings, investment returns, accounts, transactions, or external submissions are available.',
        ],
      },
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
