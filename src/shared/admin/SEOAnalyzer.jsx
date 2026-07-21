// ponytail: Real-time RankMath-like SEO score calculation and feedback panel.
import React, { useMemo } from 'react';

/**
 * SEO Analyzer component that calculates and shows live SEO score + suggestions.
 * @param {Object} props
 * @param {string} props.title - Title of post/service
 * @param {string} props.description - Meta description
 * @param {string} props.content - Rich text content
 * @param {string} props.slug - URL slug
 * @param {string} props.focusKeyword - User designated focus keyword
 * @param {string} props.altText - ALT text for image (optional)
 */
export default function SEOAnalyzer({ 
  title = '', 
  description = '', 
  content = '', 
  slug = '', 
  focusKeyword = '',
  altText = ''
}) {
  const analysis = useMemo(() => {
    const checks = [];
    let score = 0;

    if (!focusKeyword) {
      return {
        score: 0,
        checks: [{ id: 'no-keyword', passed: false, text: 'يرجى تحديد كلمة رئيسية مستهدفة لبدء التحليل.', category: 'basic' }]
      };
    }

    const keyword = focusKeyword.toLowerCase().trim();
    const cleanTitle = title.toLowerCase();
    const cleanDesc = description.toLowerCase();
    const cleanSlug = slug.toLowerCase();
    
    // Strip HTML to get plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const cleanContent = plainText.toLowerCase();

    // 1. Basic SEO Checks
    // Focus Keyword in Title
    const kwInTitle = cleanTitle.includes(keyword);
    checks.push({
      id: 'kw-title',
      passed: kwInTitle,
      text: kwInTitle ? 'الكلمة المفتاحية تظهر في العنوان.' : 'الكلمة المفتاحية لا تظهر في العنوان.',
      category: 'basic'
    });
    if (kwInTitle) score += 15;

    // Focus Keyword in Meta Description
    const kwInDesc = cleanDesc.includes(keyword);
    checks.push({
      id: 'kw-desc',
      passed: kwInDesc,
      text: kwInDesc ? 'الكلمة المفتاحية تظهر في وصف ميتا.' : 'الكلمة المفتاحية لا تظهر في وصف ميتا.',
      category: 'basic'
    });
    if (kwInDesc) score += 15;

    // Focus Keyword in Slug
    const kwInSlug = cleanSlug.includes(encodeURIComponent(keyword)) || cleanSlug.includes(keyword.replace(/\s+/g, '-'));
    checks.push({
      id: 'kw-slug',
      passed: kwInSlug,
      text: kwInSlug ? 'الكلمة المفتاحية تظهر في الرابط (Slug).' : 'الكلمة المفتاحية لا تظهر في الرابط.',
      category: 'basic'
    });
    if (kwInSlug) score += 10;

    // Focus Keyword in the beginning of Content (first 10% or first 200 chars)
    const firstParagraph = cleanContent.slice(0, 300);
    const kwInBeginning = firstParagraph.includes(keyword);
    checks.push({
      id: 'kw-begin',
      passed: kwInBeginning,
      text: kwInBeginning ? 'الكلمة المفتاحية تظهر في مقدمة المحتوى.' : 'الكلمة المفتاحية لا تظهر في الفقرة الأولى للمحتوى.',
      category: 'basic'
    });
    if (kwInBeginning) score += 10;

    // Focus Keyword in Content
    const kwInContent = cleanContent.includes(keyword);
    checks.push({
      id: 'kw-content',
      passed: kwInContent,
      text: kwInContent ? 'الكلمة المفتاحية تظهر في صلب المحتوى.' : 'الكلمة المفتاحية لا تظهر في المحتوى.',
      category: 'basic'
    });
    if (kwInContent) score += 10;

    // 2. Additional SEO Checks
    // Content length
    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const lengthPassed = wordCount >= 300;
    checks.push({
      id: 'content-len',
      passed: lengthPassed,
      text: lengthPassed ? `طول المحتوى جيد (${wordCount} كلمة).` : `المحتوى قصير جداً (${wordCount} كلمات)، يفضل كتابة 300 كلمة على الأقل.`,
      category: 'additional'
    });
    if (lengthPassed) score += 10;
    else if (wordCount > 150) score += 5;

    // Headings H2/H3 contains Keyword
    const headings = Array.from(tempDiv.querySelectorAll('h2, h3')).map(h => h.textContent.toLowerCase());
    const kwInHeadings = headings.some(h => h.includes(keyword));
    checks.push({
      id: 'kw-headings',
      passed: kwInHeadings,
      text: kwInHeadings ? 'الكلمة المفتاحية تظهر في العناوين الفرعية (H2/H3).' : 'الكلمة المفتاحية لا تظهر في العناوين الفرعية.',
      category: 'additional'
    });
    if (kwInHeadings) score += 10;

    // Keyword Density (ideal is 1% to 2.5%)
    const occurrences = (cleanContent.match(new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
    const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;
    const densityPassed = density >= 0.8 && density <= 3.0;
    checks.push({
      id: 'kw-density',
      passed: densityPassed,
      text: densityPassed ? `كثافة الكلمة المفتاحية ممتازة (${density.toFixed(2)}%).` : `كثافة الكلمة المفتاحية غير مثالية (${density.toFixed(2)}%)، يفضل أن تكون بين 1% و 2.5%.`,
      category: 'additional'
    });
    if (densityPassed) score += 10;
    else if (occurrences > 0) score += 5;

    // Alt text contains Keyword
    const altPassed = altText.toLowerCase().includes(keyword);
    checks.push({
      id: 'kw-alt',
      passed: altPassed,
      text: altPassed ? 'النص البديل للصورة يحتوي على الكلمة المفتاحية.' : 'النص البديل للصورة لا يحتوي على الكلمة المفتاحية.',
      category: 'additional'
    });
    if (altPassed) score += 5;

    // 3. Readability & Length Checks
    // Title Length (50-60 characters is optimal)
    const titleLenPassed = title.length >= 40 && title.length <= 60;
    checks.push({
      id: 'title-len',
      passed: titleLenPassed,
      text: titleLenPassed ? `طول العنوان مثالي (${title.length} حرف).` : `طول العنوان غير مثالي (${title.length} حرف)، الطول المقترح بين 40 و 60 حرفاً.`,
      category: 'readability'
    });
    if (titleLenPassed) score += 5;

    // Description Length (120-160 characters is optimal)
    const descLenPassed = description.length >= 110 && description.length <= 160;
    checks.push({
      id: 'desc-len',
      passed: descLenPassed,
      text: descLenPassed ? `طول وصف ميتا مثالي (${description.length} حرف).` : `طول وصف ميتا غير مثالي (${description.length} حرف)، الطول المقترح بين 110 و 160 حرفاً.`,
      category: 'readability'
    });
    if (descLenPassed) score += 5;

    return { score: Math.min(score, 100), checks };
  }, [title, description, content, slug, focusKeyword, altText]);

  const scoreColor = useMemo(() => {
    if (analysis.score >= 80) return '#10b981'; // Green
    if (analysis.score >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  }, [analysis.score]);

  return (
    <div className="seo-analyzer-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
          <i className="ph-duotone ph-chart-line-up" style={{ marginLeft: '0.5rem', verticalAlign: 'middle', color: scoreColor }}></i>
          تحليل SEO الفوري (RankMath)
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#718096' }}>النتيجة:</span>
          <div style={{ background: `${scoreColor}15`, color: scoreColor, padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem' }}>
            {analysis.score} / 100
          </div>
        </div>
      </div>

      <div className="analyzer-sections" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#4a5568' }}>المعايير الأساسية</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {analysis.checks.filter(c => c.category === 'basic' || c.id === 'no-keyword').map((c) => (
              <li key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: c.passed ? '#2d3748' : '#718096' }}>
                <i className={c.passed ? "ph ph-check-circle" : "ph ph-warning-circle"} style={{ color: c.passed ? '#10b981' : '#f59e0b', fontSize: '1.1rem', marginTop: '2px' }}></i>
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {focusKeyword && (
          <>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#4a5568' }}>تحليلات إضافية</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysis.checks.filter(c => c.category === 'additional').map((c) => (
                  <li key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: c.passed ? '#2d3748' : '#718096' }}>
                    <i className={c.passed ? "ph ph-check-circle" : "ph ph-warning-circle"} style={{ color: c.passed ? '#10b981' : '#f59e0b', fontSize: '1.1rem', marginTop: '2px' }}></i>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#4a5568' }}>سهولة القراءة والعناوين</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysis.checks.filter(c => c.category === 'readability').map((c) => (
                  <li key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: c.passed ? '#2d3748' : '#718096' }}>
                    <i className={c.passed ? "ph ph-check-circle" : "ph ph-warning-circle"} style={{ color: c.passed ? '#10b981' : '#f59e0b', fontSize: '1.1rem', marginTop: '2px' }}></i>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
