# Google Search Console Setup Guide
**Goal:** Get 20,428 photo URLs indexed in Google for organic discovery

---

## 📋 Prerequisites Checklist

Before starting, verify these are complete:

- ✅ Gallery deployed to production
- ✅ Sitemap.xml accessible at: `https://photography.ninochavez.co/sitemap.xml`
- ✅ Robots.txt accessible at: `https://photography.ninochavez.co/robots.txt`
- ✅ Individual photo pages working: `https://photography.ninochavez.co/photo/[id]`
- ✅ Open Graph meta tags on all pages
- ✅ Schema.org structured data on photo pages

**Status:** All prerequisites complete! ✅

---

## 🚀 Step-by-Step Setup (15 minutes)

### **Step 1: Access Google Search Console**

1. Go to: https://search.google.com/search-console
2. Sign in with your Google account (use your business/photography email)
3. Click **"Add Property"** in the top-left

---

### **Step 2: Add Your Property**

**Choose Property Type:**
- ✅ Select **"URL prefix"** (recommended)
- Enter: `https://photography.ninochavez.co`
- Click **Continue**

**Why URL prefix?**
- Easier verification
- Covers all subdomains if needed
- Simpler for single-domain sites

---

### **Step 3: Verify Ownership**

You'll see 5 verification methods. Choose ONE:

#### **Option A: HTML Tag (Easiest)** ⭐ RECOMMENDED

1. Copy the meta tag provided (looks like this):
   ```html
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```

2. Add to your site's `<head>` section:
   ```bash
   # Edit: src/routes/+layout.svelte
   # Add inside <svelte:head> block
   ```

   ```svelte
   <svelte:head>
     <!-- Existing meta tags -->

     <!-- Google Search Console Verification -->
     <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   </svelte:head>
   ```

3. Deploy the change to Vercel
4. Return to Search Console and click **Verify**

**Expected time:** 2 minutes + deployment time

---

#### **Option B: DNS TXT Record (Alternative)**

1. Copy the TXT record value provided
2. Go to your DNS provider (e.g., Namecheap, Cloudflare, GoDaddy)
3. Add a new TXT record:
   - **Host:** `@` or leave blank
   - **Value:** (paste the verification code)
   - **TTL:** Automatic or 1 hour

4. Wait 5-10 minutes for DNS propagation
5. Return to Search Console and click **Verify**

**Expected time:** 15 minutes (including DNS propagation)

---

### **Step 4: Submit Sitemap**

Once verified:

1. In Search Console, click **"Sitemaps"** in the left sidebar
2. Under "Add a new sitemap", enter: `sitemap.xml`
3. Click **Submit**

**What happens next:**
- Google will start crawling your sitemap
- You'll see "Success" status
- Indexing will begin within 24-48 hours
- Check back in 7 days to see progress

---

### **Step 5: Monitor Indexing Progress**

**Where to check:**
1. **Sitemaps Report** - Shows discovered vs. indexed URLs
2. **Pages Report** - Shows indexing status and errors
3. **Performance Report** - Shows search impressions and clicks (after 2-4 weeks)

**Expected Timeline:**
| Timeframe | Expected Result |
|-----------|----------------|
| 24 hours | Sitemap processed, crawling started |
| 7 days | 100-500 URLs indexed |
| 30 days | 5,000-10,000 URLs indexed |
| 90 days | 15,000-20,000 URLs indexed |
| 6 months | All 20,428 URLs indexed (or close) |

---

## 📊 What to Expect in Search Console

### **Sitemaps Report**

```
Sitemap: sitemap.xml
Status: Success
Discovered: 20,428
Indexed: [gradually increasing]
```

### **Pages Report - Coverage**

```
Indexed pages: [increasing over time]
Valid pages: 20,428+
Excluded pages: 0-5 (normal)
Errors: 0 (if everything is configured correctly)
```

### **Performance Report** (After 2-4 weeks)

```
Total Impressions: [shows when people see your URLs in search]
Total Clicks: [shows when people click your URLs]
Average CTR: 2-5% (typical for photo galleries)
Average Position: Varies by keyword
```

---

## 🎯 Post-Submission Action Items

### **Week 1: Monitor Crawling**
- Check Sitemaps report daily
- Look for "Success" status
- Verify discovered count = 20,428

### **Week 2: Check for Errors**
- Pages report → Coverage
- Fix any "Excluded" or "Error" pages
- Common issues:
  - 404 errors (broken links)
  - Redirect chains
  - Soft 404s (empty pages)

### **Month 1: Optimize for Search**
- Review **"Performance"** report
- See which keywords are getting impressions
- Optimize page titles and descriptions for top-performing keywords
- Add more specific keywords to photo captions

### **Month 3: Scale Indexing**
- If indexing is slow, request indexing for individual URLs
- Use "URL Inspection" tool to force crawling
- Submit additional sitemaps if needed (e.g., sport-specific)

---

## 🔍 Troubleshooting Common Issues

### **Issue: "Sitemap couldn't be read"**

**Causes:**
- Sitemap URL is incorrect
- Server is blocking Googlebot
- XML syntax error

**Fix:**
```bash
# 1. Test sitemap in browser
curl https://photography.ninochavez.co/sitemap.xml

# 2. Validate XML
# Paste sitemap content into: https://www.xml-sitemaps.com/validate-xml-sitemap.html

# 3. Check robots.txt allows crawling
curl https://photography.ninochavez.co/robots.txt
# Should see: User-agent: * / Allow: /
```

---

### **Issue: "Discovered but not indexed"**

**Causes:**
- Google is still crawling (be patient)
- Low crawl budget (too many URLs at once)
- Duplicate content
- Low-quality content

**Fix:**
1. **Wait 2-4 weeks** - Google indexes gradually
2. **Check duplicate content** - Make sure each photo URL has unique meta descriptions
3. **Improve content quality** - Add descriptive captions to more photos
4. **Request indexing** - Use URL Inspection tool for high-priority pages

---

### **Issue: "Indexed but not appearing in search"**

**Causes:**
- Not ranking yet (new site)
- Low search volume for exact keywords
- Competition from established sites

**Fix:**
1. **Target long-tail keywords** - "Nino Chavez volleyball photography" instead of "volleyball photos"
2. **Build backlinks** - Share URLs on social media, forums, your main site
3. **Add more content** - Blog posts about photography, event recaps
4. **Be patient** - SEO takes 3-6 months to show results

---

## 📈 Success Metrics to Track

### **Month 1 Goals**
- ✅ Sitemap submitted and processed
- ✅ 500+ URLs indexed
- ✅ No critical errors in Coverage report
- ✅ First search impressions showing in Performance

### **Month 3 Goals**
- ✅ 5,000+ URLs indexed
- ✅ 100+ search impressions per day
- ✅ 10+ clicks per day
- ✅ Top 10 ranking for "[Your Name] photographer"

### **Month 6 Goals**
- ✅ 15,000+ URLs indexed
- ✅ 500+ search impressions per day
- ✅ 50+ clicks per day
- ✅ Page 1 rankings for 10+ long-tail keywords

---

## 🎁 BONUS: Bing Webmaster Tools

Don't forget to also submit to Bing!

**Why?**
- 30% of US search traffic uses Bing
- Easier to rank (less competition)
- Powers Yahoo search too

**How:**
1. Go to: https://www.bing.com/webmasters
2. Click **Add a site**
3. Enter: `https://photography.ninochavez.co`
4. Verify (can import from Google Search Console!)
5. Submit sitemap: `sitemap.xml`

**Time:** 5 minutes (if importing from GSC)

---

## 📚 Additional Resources

### **Google Documentation**
- [Search Console Help](https://support.google.com/webmasters)
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Sitemaps Best Practices](https://developers.google.com/search/docs/advanced/sitemaps/overview)

### **Tools**
- [Rich Results Test](https://search.google.com/test/rich-results) - Test your Schema.org markup
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Check mobile usability
- [PageSpeed Insights](https://pagespeed.web.dev/) - Check performance scores

---

## ✅ Final Checklist

Before you close this guide, make sure you've done:

- [ ] Added property to Google Search Console
- [ ] Verified ownership (HTML tag or DNS TXT)
- [ ] Submitted sitemap.xml
- [ ] Checked sitemap status (should say "Success")
- [ ] Bookmarked Search Console for future monitoring
- [ ] (Optional) Set up Bing Webmaster Tools
- [ ] (Optional) Set up Google Analytics to track traffic

---

## 🎯 What's Next?

Once Google Search Console is set up:

1. **Wait 7 days** - Let Google start crawling and indexing
2. **Check back weekly** - Monitor indexing progress in Sitemaps report
3. **After 30 days** - Review Performance report to see which keywords are working
4. **Optimize** - Improve titles/descriptions for top-performing pages
5. **Promote** - Share your gallery on social media to drive traffic

**Remember:** SEO is a marathon, not a sprint. Results take 3-6 months, but the investment pays off with free organic traffic forever!

---

**Ready to submit?** Let's get those 20,428 photos indexed! 🚀
