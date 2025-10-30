import { Container, Typography, Box, Link, List, ListItem, Divider } from '@mui/material';
import siteInfo from '../config/siteInfo';

// This privacy policy template is written to align with common requirements of payment processors (e.g., Razorpay).
// It is original text and not copied from any third-party. Please review with your legal counsel before publishing.
const PrivacyPolicy = () => {
  const effectiveDate = '29 October 2025';

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Privacy Policy
      </Typography>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Effective date: {effectiveDate}
      </Typography>

      <Typography variant="body1" paragraph>
        {siteInfo.name} ("we", "us" or "our") respects your privacy and is committed to protecting your
        personal data. This Privacy Policy explains what personal information we collect, why we collect it, how we use it,
        and the choices you have regarding your information. This policy applies to information collected through our
        website, applications and services.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>1. Information we collect</Typography>
        <Typography variant="body2" paragraph>
          We collect the following categories of information when you use our services:
        </Typography>
        <List>
          <ListItem>
            Identity and contact data: name, email address, postal address, phone number, and other identifiers you provide.
          </ListItem>
          <ListItem>
            Transaction data: details of the services you request or purchase, payment amounts, receipts and refunds.
          </ListItem>
          <ListItem>
            Payment-related data: where needed to process payments we transmit required payment metadata to our payment processor (for example, Razorpay). We do not store full card numbers on our servers.
          </ListItem>
          <ListItem>
            KYC documents and identity verification data: when required by law or for onboarding (for example, to complete merchant KYC), we collect identification documents and related data.
          </ListItem>
          <ListItem>
            Technical and usage data: IP address, browser type, device identifiers, pages visited and other analytics data collected automatically.
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>2. How we use your information</Typography>
        <Typography variant="body2" paragraph>
          We use the information we collect for the following purposes:
        </Typography>
        <List>
          <ListItem>To provide and operate our services, including processing applications and payments.</ListItem>
          <ListItem>To verify identity and comply with KYC, anti-money laundering, and other legal obligations.</ListItem>
          <ListItem>To communicate with you about your account, service updates and support requests.</ListItem>
          <ListItem>To detect, prevent and investigate fraud, abuse and other harmful activity.</ListItem>
          <ListItem>To improve our website, services and customer experience through analytics and research.</ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>3. Payment processing and third parties</Typography>
        <Typography variant="body2" paragraph>
          We use third-party payment processors (for example, Razorpay) to process payments. Payment processing is governed by the processor's terms and privacy policy. When you make a payment, certain payment-related data will be shared securely with the payment processor to complete the transaction.
          We do not store full card numbers or CVV codes on our servers. Please review the payment processor's privacy policy for details on how they process and protect payment data.
        </Typography>

        <Typography variant="body2" paragraph>
          We may also share information with service providers who help us operate the service (for example, cloud storage, email delivery, analytics). We require these parties to use your data only for the purposes we specify and to protect it appropriately.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>4. Legal basis for processing</Typography>
        <Typography variant="body2" paragraph>
          When applicable, our legal basis for processing personal data includes performance of a contract (providing services you request), compliance with legal obligations (KYC/AML), our legitimate interests (fraud prevention, site operation), and your consent where required.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>5. Data retention</Typography>
        <Typography variant="body2" paragraph>
          We retain personal data only for as long as necessary to provide the services, comply with legal obligations, resolve disputes and enforce our agreements. Retention periods may vary depending on the type of data and legal requirements.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>6. Security</Typography>
        <Typography variant="body2" paragraph>
          We implement reasonable technical and organizational measures designed to protect personal data. However, no method of transmission or storage is completely secure; we cannot guarantee absolute security.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>7. Your rights</Typography>
        <Typography variant="body2" paragraph>
          Depending on your jurisdiction, you may have rights to access, correct, or delete your personal data, or to restrict or object to certain processing. To exercise these rights, contact us using the details below. We will respond in accordance with applicable law.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>8. KYC and onboarding</Typography>
        <Typography variant="body2" paragraph>
          For certain services and to comply with regulatory requirements, we may collect identity documents and other information to complete Know-Your-Customer (KYC) checks. The documents you submit are used solely for verification and legal compliance and may be shared with third-party verification providers or regulators when required by law.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>9. Cookies and tracking</Typography>
        <Typography variant="body2" paragraph>
          We use cookies and similar technologies to operate the site, enable functionality, and collect analytics. You can control cookies through your browser settings, but disabling cookies may limit the site's functionality.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>10. Changes to this policy</Typography>
        <Typography variant="body2" paragraph>
          We may update this Privacy Policy from time to time. We will post the updated policy on our website and indicate the effective date. Continued use of our services after changes indicates acceptance of the updated policy.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>11. Contact</Typography>
        <Typography variant="body2" paragraph>
          If you have questions, requests or concerns about this Privacy Policy or our data practices, contact us at{' '}
          <Link href={`mailto:${siteInfo.email}`}>{siteInfo.email}</Link> or call {siteInfo.phone}.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Operational address: {siteInfo.operationalAddress}
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
