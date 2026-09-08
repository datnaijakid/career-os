import * as cheerio from 'cheerio';

export interface ScrapedJobResult {
  success: boolean;
  title?: string;
  company?: string;
  location?: string;
  description: string;
  applyUrl?: string;
  portalType?: string;
  employmentType?: string;
  salaryRange?: string;
  applicationQuestions?: string[];
  sourceUrl: string;
  error?: string;
  canPasteText?: boolean;
}

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

/**
 * Strips HTML tags and unescapes standard HTML entities.
 */
function cleanHtmlText(html: string): string {
  if (!html) return '';
  const $ = cheerio.load(html);
  $('script, style, noscript, svg, iframe').remove();
  return $.text().replace(/\s+/g, ' ').trim();
}

/**
 * Attempts to parse Greenhouse URLs directly via Greenhouse's public API.
 */
async function scrapeGreenhouse(jobUrl: string): Promise<ScrapedJobResult | null> {
  try {
    const url = new URL(jobUrl);
    // Patterns: boards.greenhouse.io/{board}/jobs/{id} or job-boards.greenhouse.io/{board}/jobs/{id}
    const match = url.pathname.match(/\/(?:embed\/job_app|job[s]?\/|)([a-zA-Z0-9_-]+)\/jobs\/([0-9]+)/i)
      || url.search.match(/gh_jid=([0-9]+)/i);

    let board = '';
    let jobId = '';

    const pathSegments = url.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 3 && pathSegments[1] === 'jobs') {
      board = pathSegments[0];
      jobId = pathSegments[2];
    } else if (url.searchParams.get('for') && url.searchParams.get('token')) {
      board = url.searchParams.get('for') || '';
      jobId = url.searchParams.get('token') || '';
    } else if (url.searchParams.get('gh_jid')) {
      jobId = url.searchParams.get('gh_jid') || '';
      board = pathSegments[0] || 'company';
    }

    if (!jobId) return null;

    // Call public Greenhouse API if board is known
    if (board && board !== 'embed') {
      const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}?questions=true`;
      const res = await fetch(apiUrl, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const description = cleanHtmlText(data.content || '');
        const questions: string[] = [];
        if (Array.isArray(data.questions)) {
          data.questions.forEach((q: any) => {
            if (q.label && !['first name', 'last name', 'email', 'phone', 'resume', 'cover letter'].includes(q.label.toLowerCase())) {
              questions.push(q.label);
            }
          });
        }

        if (description.length > 50) {
          return {
            success: true,
            title: data.title || undefined,
            company: board.charAt(0).toUpperCase() + board.slice(1),
            location: data.location?.name || undefined,
            description,
            applyUrl: `https://boards.greenhouse.io/${board}/jobs/${jobId}#app`,
            portalType: 'Greenhouse ATS',
            applicationQuestions: questions.length > 0 ? questions : undefined,
            sourceUrl: jobUrl
          };
        }
      }
    }
  } catch (err) {
    // Fall back to general scraper
  }
  return null;
}

/**
 * Attempts to parse Lever URLs directly via Lever's public API.
 */
async function scrapeLever(jobUrl: string): Promise<ScrapedJobResult | null> {
  try {
    const url = new URL(jobUrl);
    // Pattern: jobs.lever.co/{company}/{id}
    const pathSegments = url.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 2 && url.hostname.includes('lever.co')) {
      const company = pathSegments[0];
      const postingId = pathSegments[1];

      const apiUrl = `https://api.lever.co/v0/postings/${company}/${postingId}`;
      const res = await fetch(apiUrl, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        let descText = cleanHtmlText(data.description || '');
        if (Array.isArray(data.lists)) {
          data.lists.forEach((l: any) => {
            descText += `\n${l.text}:\n${cleanHtmlText(l.content || '')}`;
          });
        }

        if (descText.length > 50) {
          return {
            success: true,
            title: data.text || undefined,
            company: company.charAt(0).toUpperCase() + company.slice(1),
            location: data.categories?.location || undefined,
            employmentType: data.categories?.commitment || undefined,
            description: descText.trim(),
            applyUrl: data.applyUrl || `${jobUrl}/apply`,
            portalType: 'Lever ATS',
            sourceUrl: jobUrl
          };
        }
      }
    }
  } catch (err) {
    // Fall back
  }
  return null;
}

/**
 * Scrapes job posting URL using multi-layer extraction:
 * 1. ATS Specialized APIs (Greenhouse, Lever)
 * 2. Schema.org JSON-LD (Standard across LinkedIn, Indeed, Workday, etc.)
 * 3. Semantic Job Selectors & Meta Tags
 */
export async function scrapeJobPosting(jobUrl: string): Promise<ScrapedJobResult> {
  if (!jobUrl || !jobUrl.trim()) {
    return {
      success: false,
      description: '',
      sourceUrl: jobUrl,
      error: 'Please provide a valid job posting URL.'
    };
  }

  let formattedUrl = jobUrl.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const parsedUrl = new URL(formattedUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        success: false,
        description: '',
        sourceUrl: formattedUrl,
        error: 'Invalid URL protocol. Use HTTP or HTTPS.'
      };
    }

    // 1. Try ATS Direct Handlers
    if (parsedUrl.hostname.includes('greenhouse.io')) {
      const ghResult = await scrapeGreenhouse(formattedUrl);
      if (ghResult && ghResult.description.length > 50) return ghResult;
    } else if (parsedUrl.hostname.includes('lever.co')) {
      const leverResult = await scrapeLever(formattedUrl);
      if (leverResult && leverResult.description.length > 50) return leverResult;
    }

    // 2. Fetch full HTML page with browser headers
    let html = '';
    try {
      const res = await fetch(formattedUrl, {
        headers: BROWSER_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok) {
        html = await res.text();
      } else if (res.status === 403 || res.status === 401 || res.status === 999) {
        return {
          success: false,
          description: '',
          sourceUrl: formattedUrl,
          error: `The job board (${parsedUrl.hostname}) requires a user login or blocked automated scrapers. Please paste the job description text below — CareerOS will parse all requirements and map your application!`,
          canPasteText: true
        };
      }
    } catch (networkErr: any) {
      console.warn('Scraper network fetch error:', networkErr.message);
      return {
        success: false,
        description: '',
        sourceUrl: formattedUrl,
        error: `Could not connect to ${parsedUrl.hostname}. Please paste the job description text directly below so CareerOS can analyze it.`,
        canPasteText: true
      };
    }

    if (!html || html.length < 50) {
      return {
        success: false,
        description: '',
        sourceUrl: formattedUrl,
        error: `Could not retrieve content from ${parsedUrl.hostname}. Please paste the job description text below.`,
        canPasteText: true
      };
    }

    const $ = cheerio.load(html);

    // 3. Extract from Schema.org JSON-LD (<script type="application/ld+json">)
    let jsonLdJob: any = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const rawJson = $(el).html() || '';
        const parsed = JSON.parse(rawJson);
        if (parsed['@type'] === 'JobPosting') {
          jsonLdJob = parsed;
        } else if (Array.isArray(parsed['@graph'])) {
          const found = parsed['@graph'].find((item: any) => item['@type'] === 'JobPosting');
          if (found) jsonLdJob = found;
        } else if (Array.isArray(parsed)) {
          const found = parsed.find((item: any) => item['@type'] === 'JobPosting');
          if (found) jsonLdJob = found;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    if (jsonLdJob && jsonLdJob.description) {
      const cleanDesc = cleanHtmlText(jsonLdJob.description);
      if (cleanDesc.length > 50) {
        return {
          success: true,
          title: jsonLdJob.title || undefined,
          company: jsonLdJob.hiringOrganization?.name || undefined,
          location: jsonLdJob.jobLocation?.address?.addressLocality
            ? `${jsonLdJob.jobLocation.address.addressLocality}, ${jsonLdJob.jobLocation.address.addressRegion || ''}`.trim()
            : undefined,
          employmentType: jsonLdJob.employmentType || undefined,
          description: cleanDesc,
          applyUrl: jsonLdJob.url || formattedUrl,
          sourceUrl: formattedUrl
        };
      }
    }

    // 4. Targeted Selectors Extraction
    const targetedSelectors = [
      '[data-automation-id="jobPostingDescription"]',
      '.job-description',
      '#job-description',
      '.jobDescription',
      '#jobDescriptionText',
      '.jobsearch-JobComponent-description',
      '.jobs-description__content',
      '.jobs-box__html',
      '.description__text',
      '.posting-content',
      '[class*="job-description"]',
      '[class*="jobDescription"]',
      '[id*="job-description"]',
      '[id*="jobDescription"]',
      'main article',
      'main',
      '[role="main"]'
    ];

    let extractedDesc = '';
    for (const sel of targetedSelectors) {
      const el = $(sel);
      if (el.length > 0) {
        // Remove nested scripts/styles inside selector
        el.find('script, style, noscript, nav, header, footer, svg, iframe').remove();
        const text = el.text().replace(/\s+/g, ' ').trim();
        if (text.length > 150) {
          extractedDesc = text;
          break;
        }
      }
    }

    // 5. Fallback to clean <body> text
    if (!extractedDesc || extractedDesc.length < 150) {
      $('script, style, noscript, nav, header, footer, svg, iframe, dialog').remove();
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
      if (bodyText.length > 150) {
        extractedDesc = bodyText;
      }
    }

    // 6. Meta / OpenGraph enrichment
    const pageTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const ogCompany = $('meta[property="og:site_name"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

    if (!extractedDesc || extractedDesc.length < 50) {
      if (ogDescription && ogDescription.length > 50) {
        extractedDesc = ogDescription;
      }
    }

    if (extractedDesc && extractedDesc.length > 50) {
      return {
        success: true,
        title: pageTitle ? pageTitle.split('|')[0].split('-')[0].trim() : undefined,
        company: ogCompany || undefined,
        description: extractedDesc,
        applyUrl: formattedUrl,
        sourceUrl: formattedUrl
      };
    }

    return {
      success: false,
      description: '',
      sourceUrl: formattedUrl,
      error: `Could not extract the job description from ${parsedUrl.hostname} (the site may use dynamic client-side rendering). Please paste the description text below.`,
      canPasteText: true
    };
  } catch (err: any) {
    return {
      success: false,
      description: '',
      sourceUrl: formattedUrl,
      error: `Error loading URL: ${err.message}. Please paste the job description text below.`,
      canPasteText: true
    };
  }
}
