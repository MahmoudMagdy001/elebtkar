import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for managing page metadata
 * @param {Object} props
 * @param {string} props.title - The title of the page
 * @param {string} props.description - The meta description of the page
 * @param {string} props.canonical - The canonical URL of the page
 * @param {string} props.type - The type of content (e.g., website, article)
 * @param {string} props.image - The social sharing image URL
 */
const SEO = ({ 
  title, 
  description, 
  canonical, 
  type = 'website', 
  image,
  keywords,
  schema
}) => {
  const siteName = 'الابتكار';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'الابتكار: شريكك في التسويق الرقمي بالمملكة العربية السعودية. خدمات SEO، تطوير مواقع ومتاجر، إدارة تواصل اجتماعي، وذكاء اصطناعي. اطلب استشارتك المجانية الآن.';
  const metaDescription = description || defaultDescription;
  
  // Base URL (Update this with your actual domain when deploying)
  const baseUrl = window.location.origin;
  const metaImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/src/assets/images/logs.png`;
  const metaUrl = canonical || window.location.href;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={metaUrl} />

      {/* Facebook Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      {/* Language Alternates */}
      <html lang="ar" dir="rtl" />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
