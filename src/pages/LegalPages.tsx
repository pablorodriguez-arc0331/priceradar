/**
 * Legal pages: Terms of Service, Privacy Policy, Refund Policy.
 *
 * Effective date: March 19, 2026
 * Jurisdiction: State of Delaware, United States
 * Governing standards: GDPR (EU 2016/679), CCPA (Cal. Civ. Code § 1798.100 et seq.),
 *   FTC Endorsement Guides (16 C.F.R. Part 255), CAN-SPAM Act, COPPA.
 */
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks'
import { Page } from '@/components/layout'

const EFFECTIVE_DATE = 'March 19, 2026'
const COMPANY = 'PriceRadar'
const SUPPORT_EMAIL = 'support@price-radar.io'
const LEGAL_EMAIL = 'support@price-radar.io'
const PRIVACY_EMAIL = 'support@price-radar.io'
const APP_URL = 'https://price-radar.io'

// ─── Shared primitives ────────────────────────────────────────────────────────

function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Page className="pb-10">
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="prose-legal space-y-8 pt-4"
      >
        <header className="space-y-1 border-b border-border pb-5">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">Legal</p>
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">
            Effective: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}
          </p>
        </header>
        {children}
      </motion.article>
    </Page>
  )
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3">
      <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  )
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 pl-4">
      {items.map((item, i) => (
        <li key={i} className="relative before:absolute before:-left-3 before:content-['–'] before:text-accent/50 text-sm text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  )
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-accent hover:underline underline-offset-2" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
      {children}
    </a>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  )
}

// ─── TERMS OF SERVICE ─────────────────────────────────────────────────────────

export function TermsPage() {
  useDocumentTitle('Terms of Service — PriceRadar')

  return (
    <LegalPage title="Terms of Service">
      <InfoBox>
        Please read these Terms carefully before using PriceRadar. By accessing or using the
        Service you agree to be bound by these Terms. If you do not agree, do not use the Service.
      </InfoBox>

      <Section title="1. Who We Are">
        <p>
          PriceRadar ("<strong className="text-foreground">Company</strong>", "<strong className="text-foreground">we</strong>", "us", "our") operates the website and mobile web application
          available at <A href={APP_URL}>{APP_URL}</A> and any related subdomains (the "<strong className="text-foreground">Service</strong>").
        </p>
        <p>
          For questions about these Terms, contact us at <A href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</A>.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <p>
          You must be at least 13 years old to use the Service. If you are between 13 and 18 years old,
          you represent that you have your parent's or legal guardian's permission to use the Service.
          By using the Service, you represent and warrant that you meet these requirements.
        </p>
      </Section>

      <Section title="3. Accounts">
        <Sub title="3.1 Registration">
          <p>
            Creating an account is optional for basic price checks. An account is required to track
            products and receive price alerts. You agree to provide accurate, current, and complete
            information and to keep your account information updated.
          </p>
        </Sub>
        <Sub title="3.2 Account Security">
          <p>
            You are responsible for safeguarding your login credentials. You agree to notify us
            immediately at <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> if you suspect
            unauthorized access to your account. We are not liable for losses caused by unauthorized
            use of your account.
          </p>
        </Sub>
        <Sub title="3.3 Account Termination">
          <p>
            We reserve the right to suspend or terminate your account, without prior notice or
            liability, if we reasonably believe you have violated these Terms or applicable law.
            You may delete your account at any time from the Settings page.
          </p>
        </Sub>
      </Section>

      <Section title="4. Subscription Plans and Billing">
        <Sub title="4.1 Free Plan">
          <p>
            The Free plan is provided at no charge and includes a limited set of features as
            described on the Pricing page. We reserve the right to modify or discontinue the
            Free plan at any time with reasonable notice.
          </p>
        </Sub>
        <Sub title="4.2 Pro Plan">
          <p>
            The Pro plan is a paid subscription billed monthly at the price displayed on the
            Pricing page (currently $4.99 USD/month). Prices are exclusive of applicable taxes.
            Billing is handled by Stripe, Inc. By subscribing, you authorize us to charge your
            payment method on a recurring basis until you cancel.
          </p>
        </Sub>
        <Sub title="4.3 Automatic Renewal">
          <p>
            Your Pro subscription renews automatically at the end of each billing period. You will
            be charged the then-current subscription price unless you cancel before the renewal date.
            Cancellation is available at any time in Settings &gt; Manage Subscription.
          </p>
        </Sub>
        <Sub title="4.4 Price Changes">
          <p>
            We will provide at least 30 days' advance notice of any price change by email or in-app
            notification. Your continued use of the Pro plan after the price change constitutes
            acceptance of the new price.
          </p>
        </Sub>
        <Sub title="4.5 Taxes">
          <p>
            You are responsible for all applicable taxes associated with your subscription. Where
            required by law, we will collect and remit taxes on your behalf.
          </p>
        </Sub>
      </Section>

      <Section title="5. Acceptable Use">
        <p>You agree not to:</p>
        <Ul items={[
          'Use the Service for any unlawful purpose or in violation of any applicable law or regulation.',
          'Scrape, crawl, or otherwise systematically extract data from the Service without our express written consent.',
          'Attempt to circumvent, disable, or interfere with security features of the Service.',
          'Use automated tools (bots, scrapers, scripts) to access the Service beyond normal use.',
          'Transmit viruses, malware, or any code designed to disrupt, damage, or gain unauthorized access to any system.',
          'Impersonate any person or entity or misrepresent your affiliation with any person or entity.',
          'Interfere with or disrupt the integrity or performance of the Service or third-party data contained therein.',
          'Reverse engineer, decompile, or disassemble any portion of the Service.',
        ]} />
        <p>
          Violation of this section may result in immediate termination of your account and, where
          warranted, referral to law enforcement.
        </p>
      </Section>

      <Section title="6. Price Data — Accuracy and Limitations">
        <p>
          The Service retrieves price information from third-party retailers including Amazon, Walmart,
          eBay, Best Buy, and Target. This data is provided for informational purposes only.
        </p>
        <Ul items={[
          'Prices displayed may differ from prices at checkout due to location-based pricing, seller-specific pricing, taxes, coupons, or flash promotions.',
          'Price data may be delayed by several minutes to several hours depending on your plan.',
          'We do not guarantee the availability of any product or that any price will remain constant.',
          'Historical price data represents our best-effort collection and may be incomplete.',
        ]} />
        <p>
          <strong className="text-foreground">The Service does not constitute financial, investment, or purchasing advice.</strong>{' '}
          All purchasing decisions remain solely your responsibility.
        </p>
      </Section>

      <Section title="7. Amazon Affiliate Disclosure">
        <InfoBox>
          <strong className="text-foreground">FTC Required Disclosure:</strong> PriceRadar participates in the
          Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a
          means for sites to earn advertising fees by advertising and linking to Amazon.com. When you
          click an Amazon link on PriceRadar and make a qualifying purchase, we may earn a commission
          at no additional cost to you. This affiliate relationship does not influence the price data,
          signals, or recommendations we display.
        </InfoBox>
      </Section>

      <Section title="8. Intellectual Property">
        <Sub title="8.1 Our Content">
          <p>
            The Service, including its design, text, graphics, software, data compilations,
            and all other content, is owned by or licensed to {COMPANY} and is protected by
            copyright, trademark, and other intellectual property laws. You may not reproduce,
            distribute, modify, or create derivative works without our prior written consent.
          </p>
        </Sub>
        <Sub title="8.2 Feedback">
          <p>
            Any feedback, suggestions, or ideas you submit regarding the Service ("<strong className="text-foreground">Feedback</strong>")
            become the property of {COMPANY}. We may use Feedback for any purpose without
            compensation to you.
          </p>
        </Sub>
        <Sub title="8.3 Third-Party Trademarks">
          <p>
            Product names, logos, and trademarks of retailers mentioned on the Service (Amazon,
            Walmart, eBay, Best Buy, Target) belong to their respective owners. Reference to
            these marks does not imply endorsement by those companies.
          </p>
        </Sub>
      </Section>

      <Section title="9. Third-Party Services">
        <p>
          The Service relies on the following third-party providers whose terms and privacy
          policies also apply to your use:
        </p>
        <Ul items={[
          'Supabase, Inc. — database, authentication, and cloud infrastructure.',
          'Stripe, Inc. — payment processing for Pro subscriptions.',
          'Amazon Web Services, Inc. — cloud infrastructure.',
          'Google LLC — authentication (Google Sign-In) and web fonts.',
          'Amazon Services LLC — affiliate program and product data.',
        ]} />
        <p>
          We are not responsible for the acts or omissions of these third parties.
        </p>
      </Section>

      <Section title="10. Privacy">
        <p>
          Our <A href="/privacy">Privacy Policy</A> describes how we collect, use, and share
          information about you and is incorporated into these Terms by reference.
        </p>
      </Section>

      <Section title="11. Disclaimer of Warranties">
        <p className="uppercase text-xs font-semibold text-foreground">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF PRICE DATA, AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant that (a) the Service will be uninterrupted, secure, or error-free;
          (b) any defects will be corrected; or (c) price information is accurate, complete,
          or current. Your use of the Service is at your sole risk.
        </p>
      </Section>

      <Section title="12. Limitation of Liability">
        <p className="uppercase text-xs font-semibold text-foreground">
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL {COMPANY},
          ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOST PROFITS, LOSS OF DATA,
          OR GOODWILL — ARISING OUT OF OR RELATED TO YOUR USE OF, OR INABILITY TO USE, THE SERVICE,
          EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          Our total liability to you for any claims arising from or related to the Service shall
          not exceed the greater of (a) $50 USD or (b) the amount you paid us in the 12 months
          preceding the claim.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties or limitation of
          liability for consequential or incidental damages; in such jurisdictions, our liability
          is limited to the greatest extent permitted by law.
        </p>
      </Section>

      <Section title="13. Indemnification">
        <p>
          You agree to defend, indemnify, and hold harmless {COMPANY} and its affiliates,
          officers, directors, employees, and agents from and against any claims, damages,
          obligations, losses, liabilities, costs, or debt arising from: (a) your use of and
          access to the Service; (b) your violation of any term of these Terms; or (c) your
          violation of any third-party right.
        </p>
      </Section>

      <Section title="14. Governing Law and Dispute Resolution">
        <Sub title="14.1 Governing Law">
          <p>
            These Terms are governed by the laws of the State of Delaware, United States,
            without regard to its conflict-of-law principles.
          </p>
        </Sub>
        <Sub title="14.2 Informal Resolution">
          <p>
            Before filing a formal dispute, you agree to contact us at <A href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</A> and
            give us 30 days to resolve the issue informally.
          </p>
        </Sub>
        <Sub title="14.3 Binding Arbitration">
          <p>
            Any dispute not resolved informally shall be submitted to binding arbitration administered
            by JAMS pursuant to its Comprehensive Arbitration Rules. The arbitration shall take place
            in Wilmington, Delaware, or virtually. The arbitrator's award is final and binding.
          </p>
        </Sub>
        <Sub title="14.4 Class Action Waiver">
          <p>
            You and {COMPANY} each waive the right to bring claims as a plaintiff or class member
            in any purported class action, consolidated, or representative proceeding.
          </p>
        </Sub>
      </Section>

      <Section title="15. Changes to These Terms">
        <p>
          We may update these Terms from time to time. We will notify you of material changes
          by email or by posting a prominent notice in the Service at least 15 days before the
          changes take effect. Continued use of the Service after changes take effect constitutes
          your acceptance of the new Terms.
        </p>
      </Section>

      <Section title="16. General">
        <Ul items={[
          'Entire Agreement: These Terms, together with the Privacy Policy and Refund Policy, constitute the entire agreement between you and PriceRadar regarding the Service.',
          'Severability: If any provision is found unenforceable, the remaining provisions remain in full effect.',
          'Waiver: Our failure to enforce any right or provision does not constitute a waiver of that right.',
          'Assignment: You may not assign your rights under these Terms without our prior written consent. We may freely assign our rights.',
          'Force Majeure: We are not liable for delays or failures due to causes beyond our reasonable control.',
        ]} />
      </Section>

      <Section title="17. Contact">
        <p>
          Questions about these Terms should be directed to:{' '}
          <A href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</A>
        </p>
        <p>
          PriceRadar<br />
          <A href={APP_URL}>{APP_URL}</A>
        </p>
      </Section>
    </LegalPage>
  )
}

// ─── PRIVACY POLICY ───────────────────────────────────────────────────────────

export function PrivacyPage() {
  useDocumentTitle('Privacy Policy — PriceRadar')

  return (
    <LegalPage title="Privacy Policy">
      <InfoBox>
        This Privacy Policy explains how PriceRadar collects, uses, discloses, and protects
        your personal information. We are committed to protecting your privacy and complying
        with applicable data protection laws including the GDPR (EU 2016/679) and the CCPA
        (Cal. Civ. Code § 1798.100 et seq.).
      </InfoBox>

      <Section title="1. Data Controller">
        <p>
          PriceRadar is the data controller of your personal information collected through the
          Service. Contact our data protection point of contact at{' '}
          <A href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</A>.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <Sub title="2.1 Information You Provide">
          <Ul items={[
            'Account information: email address, display name, and profile photo (when you sign up or sign in via Google OAuth).',
            'Payment information: billing details collected and processed by Stripe, Inc. We do not store full card numbers.',
            'Communications: emails or messages you send us.',
          ]} />
        </Sub>
        <Sub title="2.2 Information We Collect Automatically">
          <Ul items={[
            'Usage data: pages visited, features used, products checked, search history, price check timestamps.',
            'Device and browser information: browser type and version, operating system, device type, screen resolution.',
            'IP address and approximate location (country/region level) derived from IP.',
            'Referring URLs and session duration.',
            'Service worker and PWA installation status.',
          ]} />
        </Sub>
        <Sub title="2.3 Information from Third Parties">
          <Ul items={[
            'Google: if you sign in with Google, we receive your Google account ID, email, name, and profile picture as authorized by you.',
            'Stripe: subscription status and anonymized billing identifiers.',
          ]} />
        </Sub>
        <Sub title="2.4 Cookies and Similar Technologies">
          <p>
            We use browser-native storage (localStorage, sessionStorage) and cookies for:
          </p>
          <Ul items={[
            'Authentication session tokens (strictly necessary).',
            'Theme preference (dark/light) (functional).',
            'Anonymous search history (functional).',
            'PWA installation state (functional).',
          ]} />
          <p>
            We do not use advertising or cross-site tracking cookies. You can clear stored data
            via your browser settings; doing so will sign you out and reset your preferences.
          </p>
        </Sub>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We process your personal information for the following purposes and legal bases:</p>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-semibold text-foreground">Purpose</th>
                <th className="py-2 pr-3 text-left font-semibold text-foreground">Legal Basis (GDPR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                ['Provide and operate the Service', 'Contract performance (Art. 6(1)(b))'],
                ['Process payments and manage subscriptions', 'Contract performance (Art. 6(1)(b))'],
                ['Send price alert notifications', 'Contract performance / Consent'],
                ['Detect fraud and ensure security', 'Legitimate interests (Art. 6(1)(f))'],
                ['Comply with legal obligations', 'Legal obligation (Art. 6(1)(c))'],
                ['Improve the Service (analytics)', 'Legitimate interests (Art. 6(1)(f))'],
                ['Send service emails (receipts, policy changes)', 'Contract performance / Legitimate interests'],
                ['Respond to support requests', 'Legitimate interests (Art. 6(1)(f))'],
              ].map(([purpose, basis]) => (
                <tr key={purpose}>
                  <td className="py-2 pr-3 text-muted-foreground">{purpose}</td>
                  <td className="py-2 text-muted-foreground">{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="4. How We Share Your Information">
        <p>We do not sell your personal information. We share information only in these circumstances:</p>
        <Ul items={[
          'Service providers: Supabase (database/auth), Stripe (payments), Amazon Web Services (infrastructure), Google (OAuth). These providers are bound by data processing agreements.',
          'Amazon Associates: anonymized affiliate click data as required by the Amazon Associates program.',
          'Legal compliance: if required by law, court order, or governmental authority.',
          'Business transfers: in the event of a merger, acquisition, or sale of assets, with advance notice to you.',
          'Protection of rights: to enforce our Terms, protect our property or safety, or protect users or the public.',
          'With your consent: for any other purpose with your explicit prior consent.',
        ]} />
      </Section>

      <Section title="5. Data Retention">
        <Ul items={[
          'Account data: retained for the duration of your account plus 90 days after deletion.',
          'Search history: retained while your account is active; deleted immediately upon account deletion.',
          'Payment records: retained for 7 years as required by applicable tax and financial regulations.',
          'Anonymous (localStorage) data: stored only on your device; we have no access to or control over it.',
          'Aggregated, de-identified analytics: retained indefinitely.',
        ]} />
      </Section>

      <Section title="6. Data Security">
        <p>
          We implement technical and organizational measures appropriate to the risk, including:
        </p>
        <Ul items={[
          'TLS 1.2+ encryption for all data in transit.',
          'At-rest encryption via Supabase (AES-256).',
          'Row-level security (RLS) policies ensuring users can only access their own data.',
          'Least-privilege access controls for employees and service accounts.',
          'Regular security reviews.',
        ]} />
        <p>
          No system is completely secure. In the event of a data breach that affects your rights,
          we will notify you as required by applicable law, no later than 72 hours after we become
          aware (GDPR Art. 33/34).
        </p>
      </Section>

      <Section title="7. Your Rights">
        <Sub title="7.1 Rights Under GDPR (EEA, UK, Switzerland)">
          <p>If you are located in the EEA, UK, or Switzerland, you have the right to:</p>
          <Ul items={[
            'Access: request a copy of personal data we hold about you.',
            'Rectification: request correction of inaccurate or incomplete data.',
            'Erasure ("right to be forgotten"): request deletion of your personal data, subject to legal retention requirements.',
            'Restriction: request we restrict processing of your data in certain circumstances.',
            'Portability: receive your data in a structured, machine-readable format.',
            'Object: object to processing based on legitimate interests.',
            'Withdraw consent: where processing is based on consent, withdraw it at any time without affecting prior processing.',
            'Lodge a complaint: with your local data protection authority.',
          ]} />
        </Sub>
        <Sub title="7.2 Rights Under CCPA (California Residents)">
          <p>California residents have the right to:</p>
          <Ul items={[
            'Know: request disclosure of categories and specific pieces of personal information we have collected about you.',
            'Delete: request deletion of your personal information, subject to certain exceptions.',
            'Correct: request correction of inaccurate personal information.',
            'Opt-out of Sale or Sharing: we do not sell or share personal information for cross-context behavioral advertising.',
            'Non-discrimination: exercise these rights without discrimination.',
          ]} />
          <p>
            To submit a CCPA request, email <A href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</A> with
            "California Privacy Request" in the subject line. We will respond within 45 days.
          </p>
        </Sub>
        <Sub title="7.3 Exercising Your Rights">
          <p>
            To exercise any privacy right, email <A href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</A>.
            We may need to verify your identity before processing your request.
            We will respond within 30 days (GDPR) or 45 days (CCPA) of a verified request.
          </p>
        </Sub>
      </Section>

      <Section title="8. International Data Transfers">
        <p>
          PriceRadar is based in the United States. If you are located in the EEA, UK, or
          another jurisdiction with data transfer restrictions, your information may be
          transferred to and processed in the US. We rely on:
        </p>
        <Ul items={[
          'Standard Contractual Clauses (SCCs) approved by the European Commission.',
          'Adequacy decisions where applicable.',
          'The Data Privacy Framework (where applicable) for US-based sub-processors.',
        ]} />
      </Section>

      <Section title="9. Children's Privacy">
        <p>
          The Service is not directed to children under 13 years of age (or under 16 in the EEA).
          We do not knowingly collect personal information from children under 13. If we learn we
          have collected such information, we will delete it promptly. If you believe a child has
          provided us personal information, contact us at <A href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</A>.
        </p>
      </Section>

      <Section title="10. Affiliate Disclosure">
        <p>
          PriceRadar participates in the Amazon Services LLC Associates Program. When you click
          affiliate links and make qualifying purchases, we receive a commission. We do not share
          your personal information with Amazon beyond what is necessary for affiliate tracking
          (anonymized click IDs). Amazon's privacy policy applies to your interactions on Amazon.
        </p>
      </Section>

      <Section title="11. Links to Third-Party Sites">
        <p>
          The Service contains links to retailer websites. This Privacy Policy applies only to
          PriceRadar. We encourage you to review the privacy policies of any third-party site
          you visit.
        </p>
      </Section>

      <Section title="12. Changes to This Policy">
        <p>
          We will notify you of material changes by email or in-app notification at least 15 days
          before they take effect. The "Last updated" date at the top reflects the most recent revision.
          Continued use of the Service after changes take effect constitutes acceptance.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          Privacy inquiries: <A href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</A><br />
          General support: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>
        </p>
        <p>
          PriceRadar · <A href={APP_URL}>{APP_URL}</A>
        </p>
      </Section>
    </LegalPage>
  )
}

// ─── REFUND POLICY ────────────────────────────────────────────────────────────

export function RefundPage() {
  const navigate = useNavigate()
  useDocumentTitle('Refund Policy — PriceRadar')

  return (
    <LegalPage title="Refund Policy">
      <InfoBox>
        We want you to love PriceRadar. If you are not satisfied with your Pro subscription,
        this policy explains when and how we issue refunds.
      </InfoBox>

      <Section title="1. 7-Day Money-Back Guarantee">
        <p>
          If you are not satisfied with PriceRadar Pro for any reason, you may request a full
          refund within <strong className="text-foreground">7 calendar days</strong> of your
          initial subscription purchase. This guarantee applies to first-time subscribers only
          and does not apply to subsequent renewal charges.
        </p>
        <p>
          To request a refund under the money-back guarantee, email us at{' '}
          <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> with:
        </p>
        <Ul items={[
          'Subject line: "Refund Request — Money-Back Guarantee"',
          'The email address associated with your PriceRadar account.',
          'Your reason for cancelling (optional, but helps us improve).',
        ]} />
        <p>
          We will process your refund within <strong className="text-foreground">5 business days</strong> of
          receiving a valid request. Refunds are issued to the original payment method.
        </p>
      </Section>

      <Section title="2. Subscription Cancellation">
        <Sub title="2.1 How to Cancel">
          <p>
            You can cancel your Pro subscription at any time via{' '}
            <button
              onClick={() => navigate('/settings')}
              className="text-accent hover:underline focus-visible:outline-none"
            >
              Settings &gt; Manage Subscription
            </button>
            {' '}or by emailing <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
          </p>
        </Sub>
        <Sub title="2.2 Access After Cancellation">
          <p>
            Cancellation takes effect at the end of the current billing period. You retain full
            Pro access until that date. No partial-month refunds are issued for cancellations
            after the 7-day guarantee window.
          </p>
        </Sub>
        <Sub title="2.3 Effect on Your Data">
          <p>
            Cancelling your subscription does not delete your account or data. You are
            automatically moved to the Free plan. If you have more than 3 tracked products,
            tracking pauses on the oldest entries until you re-upgrade or remove items.
          </p>
        </Sub>
      </Section>

      <Section title="3. Renewal Charges">
        <p>
          We do not issue refunds for subscription renewal charges unless:
        </p>
        <Ul items={[
          'The renewal was the result of a technical error on our part.',
          'You contact us within 48 hours of the renewal charge and have not used any Pro features since the renewal.',
          'We failed to provide the required advance notice of a price increase.',
        ]} />
        <p>
          To dispute a renewal charge, email <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> within
          48 hours of the charge.
        </p>
      </Section>

      <Section title="4. Exceptions — No Refund">
        <p>The following are not eligible for a refund:</p>
        <Ul items={[
          'Requests made more than 7 days after initial purchase (outside the guarantee window).',
          'Renewal charges where Pro features were used after renewal.',
          'Accounts terminated for violation of our Terms of Service.',
          'Partial months or unused periods of a subscription beyond the guarantee window.',
          'Differences in product pricing between PriceRadar\'s displayed data and actual retailer checkout prices (we display price data, not prices for our own products).',
        ]} />
      </Section>

      <Section title="5. Chargebacks">
        <p>
          If you initiate a chargeback with your bank or card issuer without first contacting us,
          we reserve the right to suspend or terminate your account pending resolution.
          We encourage you to contact us first — most issues can be resolved quickly.
        </p>
      </Section>

      <Section title="6. Payment Processor">
        <p>
          All payments are processed by Stripe, Inc. Refunds are subject to Stripe's processing
          timelines. Once we issue a refund, it typically appears on your statement within
          5–10 business days depending on your bank.
        </p>
      </Section>

      <Section title="7. Changes to This Policy">
        <p>
          We may update this Refund Policy from time to time. The current version is always
          available at <A href="/refund">price-radar.io/refund</A>. Changes take effect upon posting.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          Refund requests and questions: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>
        </p>
        <p>
          We aim to respond to all refund requests within 1 business day.
        </p>
      </Section>
    </LegalPage>
  )
}
