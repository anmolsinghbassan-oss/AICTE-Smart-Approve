import { APH_REFERENCES } from './data/aphReferences.js';
import { db } from './dataStore.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  docAnalysis?: any;
}

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'bn';

/**
 * Detects language from user message script and characteristic keywords
 */
export function detectLanguage(text: string): SupportedLanguage {
  // Bengali Unicode range: 0980–09FF
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'bn';
  }
  // Tamil Unicode range: 0B80–0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return 'ta';
  }
  // Devanagari Unicode range: 0900–097F (Used by Hindi & Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    // Distinctive Marathi markers (Devanagari characters without ASCII \b)
    const marathiWords = ['आहे', 'नाही', 'माझा', 'माझी', 'कशी', 'कसा', 'करा', 'अहवाल', 'पडताळणी', 'तपासणी', 'माहिती', 'प्रलंबित', 'झाला', 'झाली', 'करावी', 'द्यावे', 'निकष', 'कागदपत्रे', 'संस्थेच्या', 'गुणसंख्या'];
    // Distinctive Hindi markers
    const hindiWords = ['है', 'हैं', 'क्यों', 'कैसे', 'क्या', 'आवेदन', 'दस्तावेज', 'दस्तावेज़', 'रुकी', 'अर्ज़ी', 'अर्जी', 'अंक', 'कमी', 'करें', 'कीजिए', 'होगा', 'होगी', 'मेरी', 'मेरा'];

    const hasMarathi = marathiWords.some(w => text.includes(w));
    const hasHindi = hindiWords.some(w => text.includes(w));

    if (hasMarathi && !hasHindi) {
      return 'mr';
    }
    if (hasHindi && !hasMarathi) {
      return 'hi';
    }
    if (hasMarathi) {
      return 'mr';
    }
    return 'hi';
  }

  return 'en';
}

export async function processAIChat(
  messages: ChatMessage[],
  contextUser?: { role: string; institutionId?: string; name: string },
  selectedLanguage?: string
): Promise<{ reply: string; citations: string[]; suggestedChips: string[]; docAnalysis?: any }> {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  
  // Resolve language: auto-detect from user text; if not non-English, use selectedLanguage if present
  let detectedLang: SupportedLanguage = 'en';
  const autoLang = detectLanguage(lastUserMessage);
  if (autoLang !== 'en') {
    detectedLang = autoLang;
  } else if (selectedLanguage && ['en', 'hi', 'mr', 'ta', 'bn'].includes(selectedLanguage)) {
    detectedLang = selectedLanguage as SupportedLanguage;
  }

  // Look up actual institution context if available
  let instituteData: any = null;
  let instituteDocs: any[] = [];
  let instituteApps: any[] = [];
  if (contextUser?.institutionId) {
    instituteData = db.getInstitutionById(contextUser.institutionId);
    instituteDocs = db.getDocuments().filter(d => d.institutionId === contextUser.institutionId);
    instituteApps = db.getApplications().filter(a => a.institutionId === contextUser.institutionId);
  }

  // Check if GEMINI_API_KEY is available in environment
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const languageInstruction = {
        en: 'English',
        hi: 'Hindi (हिन्दी - Devanagari script)',
        mr: 'Marathi (मराठी - Devanagari script)',
        ta: 'Tamil (தமிழ்)',
        bn: 'Bengali (বাংলা)'
      }[detectedLang];

      const systemInstruction = `You are the AICTE SmartApprove Statutory AI Assistant for the All India Council for Technical Education (Government of India).
User Role: ${contextUser?.role || 'Institution Representative'}. Name: ${contextUser?.name || 'User'}.
Target Institution Context: ${instituteData ? `${instituteData.name} (AICTE ID: ${instituteData.id}, State: ${instituteData.state}, Compliance Score: ${instituteData.complianceScore}/100, Status: ${instituteData.status})` : 'General statutory guidance'}.
${instituteDocs.length > 0 ? `Uploaded Documents Count: ${instituteDocs.length} (${instituteDocs.filter(d => d.verificationStatus === 'Approved').length} approved, ${instituteDocs.filter(d => d.verificationStatus === 'Pending').length} pending, ${instituteDocs.filter(d => d.verificationStatus === 'Rejected').length} rejected).` : ''}

CRITICAL INSTRUCTIONS:
1. Respond in EXACTLY the user's language: ${languageInstruction}.
2. Always ground your advice in AICTE Approval Process Handbook (APH 2026) clauses.
3. Be direct, authoritative yet supportive, with clear headings and bullet points.
4. If the query is outside AICTE approvals, education regulations, or institutional compliance, politely decline and redirect the user back to AICTE topics in ${languageInstruction}.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${lastUserMessage}` }] }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiReply) {
          return {
            reply: geminiReply,
            citations: ['APH 2026 Handbook', 'AICTE Regulations'],
            suggestedChips: getSuggestedChips(detectedLang)
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to rule-based engine:', err);
    }
  }

  // --- High-Fidelity Multilingual Knowledge Fallback Engine ---
  return generateMultilingualIntelligentResponse(lastUserMessage, detectedLang, contextUser, instituteData, instituteDocs, instituteApps);
}

function getSuggestedChips(lang: SupportedLanguage): string[] {
  switch (lang) {
    case 'hi':
      return ['अनुपालन स्कोर की जांच करें', 'दस्तावेज़ सत्यापन स्थिति', 'मेरी अर्ज़ी क्यों रुकी है?', 'फायर एनओसी नियम'];
    case 'mr':
      return ['अनुपालन गुण तपासा', 'कागदपत्र स्थिती', 'माझा अर्ज का प्रलंबित आहे?', 'अग्निशमन एनओसी नियम'];
    case 'ta':
      return ['இணக்க மதிப்பெண் பார்க்க', 'ஆவண சரிபார்ப்பு நிலை', 'விண்ணப்பம் ஏன் நிலுவையில் உள்ளது?', 'தீயணைப்பு என்ஓசி'];
    case 'bn':
      return ['সম্মতি স্কোর দেখুন', 'নথি যাচাইকরণের অবস্থা', 'আমার আবেদন কেন আটকে আছে?', 'ফায়ার এনওসি নিয়ম'];
    default:
      return ['Check Compliance Score', 'Document Verification Status', 'Why is my application stuck?', 'Fire NOC & Safety Norms'];
  }
}

function isOutOfScope(lowerMsg: string): boolean {
  const outOfScopeKeywords = [
    'weather', 'recipe', 'cook', 'cricket', 'football', 'movie', 'song',
    'joke', 'bitcoin', 'crypto', 'stock market', 'game', 'politics',
    'मौसम', 'खाना', 'क्रिकेट', 'सिनेमा', 'गाना', 'हवामान', 'चित्रपट', 'பாடல்', 'சினிமா', 'গান', 'রান্না'
  ];
  return outOfScopeKeywords.some(w => lowerMsg.includes(w));
}

function generateMultilingualIntelligentResponse(
  rawMsg: string,
  lang: SupportedLanguage,
  contextUser?: { role: string; institutionId?: string; name: string },
  inst?: any,
  docs: any[] = [],
  apps: any[] = []
): { reply: string; citations: string[]; suggestedChips: string[]; docAnalysis?: any } {
  const lower = rawMsg.toLowerCase();

  // Check out of scope
  if (isOutOfScope(lower)) {
    const outOfScopeReplies: Record<SupportedLanguage, string> = {
      en: `### ℹ️ Topic Outside AICTE Approval Scope
I am the specialized statutory assistant for the **AICTE SmartApprove** portal. I can only assist with:
- AICTE Approval Process Handbook (APH 2026) norms
- Institutional application status and bottlenecks
- Document verification, re-upload, and fraud prevention
- Compliance scores and faculty-student ratios (FSR)
- Inspection schedules and public verification certificates

Please ask a question related to your institution's approvals or compliance.`,
      hi: `### ℹ️ यह विषय एआईसीटीई अनुमोदन क्षेत्र से बाहर है
मैं **एआईसीटीई स्मार्टअपरूव** पोर्टल का अधिकृत वैधानिक सहायक हूँ। मैं केवल निम्नलिखित विषयों में सहायता कर सकता हूँ:
- एआईसीटीई अनुमोदन प्रक्रिया हैंडबुक (APH 2026) नियम
- संस्थान के आवेदन की प्रगति एवं रुकावटों का समाधान
- दस्तावेज़ सत्यापन, पुनः अपलोड और धोखाधड़ी निवारण
- अनुपालन स्कोर एवं शिक्षक-छात्र अनुपात (FSR)
- निरीक्षण कार्यक्रम एवं सार्वजनिक क्यूआर सत्यापन

कृपया अपने कॉलेज के अनुमोदन या अनुपालन से संबंधित प्रश्न पूछें।`,
      mr: `### ℹ️ हा विषय एआयसीटीई मंजुरी कक्षेबाहेर आहे
मी **एआयसीटीई स्मार्टअपरूव** पोर्टलचा वैधानिक सहाय्यक आहे. मी खालील विषयांमध्ये मार्गदर्शन करू शकतो:
- एआयसीटीई नियम व हँडबुक (APH 2026) निकष
- संस्थेच्या अर्जाची सद्यस्थिती व त्रुटी निराकरण
- कागदपत्र पडताळणी, फेर-अपलोड व मान्यता
- अनुपालन गुण (Compliance Score) व शिक्षक-विद्यार्थी प्रमाण
- तपासणी वेळापत्रक व सार्वजनिक क्यूआर पडताळणी

कृपया आपल्या संस्थेच्या मंजुरीसंदर्भात प्रश्न विचारा.`,
      ta: `### ℹ️ இந்த தலைப்பு AICTE ஒப்புதல் எல்லைக்கு அப்பாற்பட்டது
நான் **AICTE SmartApprove** போர்ட்டலின் அதிகாரப்பூர்வ சட்ட உதவியாளர். என்னால் பின்வருவனவற்றிற்கு மட்டுமே உதவ முடியும்:
- AICTE ஒப்புதல் கையேடு (APH 2026) விதிகள்
- உங்கள் கல்லூரியின் விண்ணப்ப நிலை மற்றும் தாமதங்களுக்கான காரணங்கள்
- ஆவண சரிபார்ப்பு, மறுபதிவேற்றம்
- இணக்க மதிப்பெண் மற்றும் ஆசிரியர்-மாணவர் விகிதம்
- ஆய்வுகள் மற்றும் பொது க்யூஆர் சரிபார்ப்பு

தயவுசெய்து AICTE ஒப்புதல் தொடர்பான கேள்விகளைக் கேளுங்கள்.`,
      bn: `### ℹ️ এই বিষয়টি AICTE অনুমোদন ক্ষেত্রের বাইরে
আমি **AICTE SmartApprove** পোর্টালের বিধিবদ্ধ সহকারী। আমি শুধুমাত্র নিম্নলিখিত বিষয়ে সাহায্য করতে পারি:
- AICTE অনুমোদন নির্দেশিকা (APH 2026) নিয়মাবলী
- প্রতিষ্ঠানের আবেদনের অবস্থা ও বিলম্বের কারণ
- নথি যাচাইকরণ, পুনরায় আপলোড ও স্বীকৃতি
- সম্মতি স্কোর ও শিক্ষক-শিক্ষার্থী অনুপাত
- পরিদর্শন কর্মসূচি ও সর্বজনীন কিউআর যাচাইকরণ

অনুগ্রহ করে আপনার প্রতিষ্ঠানের অনুমোদন সংক্রান্ত প্রশ্ন জিজ্ঞাসা করুন।`
    };

    return {
      reply: outOfScopeReplies[lang] || outOfScopeReplies.en,
      citations: ['APH 2026 Guidelines'],
      suggestedChips: getSuggestedChips(lang)
    };
  }

  // 1. Stuck application / Delay / Status
  if (
    lower.includes('stuck') || lower.includes('pending') || lower.includes('delay') ||
    lower.includes('status') || lower.includes('रुक') || lower.includes('अटक') ||
    lower.includes('अडकल') || lower.includes('प्रलंबित') || lower.includes('தாமத') || lower.includes('நிலுவை') || lower.includes('আটকে') || lower.includes('মুলতুবি')
  ) {
    const instName = inst?.name || 'Sardar Patel College of Engineering, Mumbai';
    const appId = apps[0]?.id || 'APP-2026-1002';
    const stage = apps[0]?.stage || 'Scrutiny';

    if (lang === 'hi') {
      return {
        reply: `### ⏱️ आवेदन स्थिति एवं रुकावट विश्लेषण (Diagnostic Report)
**संस्थान:** ${instName}
**आवेदन संदर्भ:** \`${appId}\`
**वर्तमान चरण:** **चरण 3 - संवीक्षा (कमी दर्ज / Scrutiny Deficiency)**
**निरीक्षक अधिकारी:** डॉ. राजेश शर्मा (क्षेत्रीय कार्यालय, पश्चिमी क्षेत्र)

#### रुकावट का मुख्य कारण:
1. **फायर एनओसी नवीनीकरण:** प्रस्तुत फायर सुरक्षा प्रमाणपत्र की वैधता शैक्षणिक चक्र की अवधि से पहले समाप्त हो रही है ([APH नियम 4.2])।
2. **फैकल्टी ओवरलैप जांच:** एक संकाय सदस्य का रिकॉर्ड अन्य संस्थान में भी दर्ज पाया गया था ([APH नियम 7.1])।

#### आवश्यक कार्रवाई (Next Steps):
- **संस्थान डैशबोर्ड** पर जाकर नया नवीनीकृत फायर एनओसी अथवा आवेदन पावती रसीद अपलोड करें।
- रिलीविंग दस्तावेज पहले ही दर्ज हैं; क्षेत्रीय अधिकारी द्वारा 2 कार्यदिवसों में संवीक्षा पूर्ण की जाएगी।`,
        citations: ['APH 2026 नियम 7.1', 'APH 2026 नियम 4.2'],
        suggestedChips: ['संस्थान डैशबोर्ड खोलें', 'दस्तावेज़ फिर से अपलोड करें', 'अनुपालन स्कोर देखें']
      };
    }

    if (lang === 'mr') {
      return {
        reply: `### ⏱️ अर्ज स्थिती व विलंब विश्लेषण अहवाल
**संस्था:** ${instName}
**अर्ज क्रमांक:** \`${appId}\`
**सध्याचा टप्पा:** **टप्पा ३ - छाननी व त्रुटी निवारण (Scrutiny Deficiency)**
**नियुक्त अधिकारी:** डॉ. राजेश शर्मा (प्रादेशिक अधिकारी, पश्चिम विभाग)

#### विलंब कशामुळे झाला आहे?
१. **अग्निशमन एनओसी वैधता:** सादर केलेल्या फायर सेफ्टी प्रमाणपत्राची मुदत संपत आली आहे ([APH नियम ४.२]).
२. **प्राध्यापक दुहेरी नोंदणी तपासणी:** एका प्राध्यापकाचे नाव अन्य संस्थेतही आढळले होते ([APH नियम ७.१]).

#### पुढील आवश्यक कृती:
- **संस्था डॅशबोर्डवर** जाऊन नूतनीकृत फायर एनओसी किंवा पावती अपलोड करा.
- प्रादेशिक अधिकारी पुढील २ दिवसांत पडताळणी पूर्ण करून अर्ज टप्पा ५ कडे पाठवतील.`,
        citations: ['APH 2026 कलम ७.१', 'APH 2026 कलम ४.२'],
        suggestedChips: ['संस्था डॅशबोर्ड पहा', 'कागदपत्र बदला', 'अनुपालन गुण तपासा']
      };
    }

    if (lang === 'ta') {
      return {
        reply: `### ⏱️ விண்ணப்ப நிலை மற்றும் தாமத பகுப்பாய்வு
**நிறுவனம்:** ${instName}
**விண்ணப்ப எண்:** \`${appId}\`
**தற்போதைய நிலை:** **நிலை 3 - ஆவண ஆய்வு (Scrutiny)**

#### தாமதத்திற்கான காரணங்கள்:
1. **தீ பாதுகாப்பு சான்றிதழ் (Fire NOC):** சமர்ப்பிக்கப்பட்ட சான்றிதழின் காலாவதி தேதி நெருங்கியுள்ளது ([APH விதி 4.2]).
2. **ஆசிரியர் இரட்டைப் பதிவு:** ஒரு ஆசிரியர் வேறு கல்லூரியிலும் பட்டியலிடப்பட்டிருந்தது கண்டறியப்பட்டது ([APH விதி 7.1]).

#### அடுத்த நடவடிக்கைகள்:
- புதிய அல்லது புதுப்பிக்கப்பட்ட தீ பாதுகாப்பு ரசீதை கல்லூரி டாஷ்போர்டில் பதிவேற்றவும்.`,
        citations: ['APH 2026 விதி 7.1', 'APH 2026 விதி 4.2'],
        suggestedChips: ['டாஷ்போர்டு செல்க', 'ஆவணம் பதிவேற்றுக']
      };
    }

    if (lang === 'bn') {
      return {
        reply: `### ⏱️ আবেদনের অবস্থা ও বিলম্ব বিশ্লেষণ প্রতিবেদন
**প্রতিষ্ঠান:** ${instName}
**আবেদন আইডি:** \`${appId}\`
**বর্তমান পর্যায়:** **পর্যায় ৩ - যাচাইকরণ ও ঘাটতি (Scrutiny Deficiency)**

#### বিলম্বের মূল কারণ:
১. **ফায়ার এনওসি মেয়াদ:** জমা দেওয়া ফায়ার সেফটি সনদের মেয়াদ শীঘ্রই শেষ হচ্ছে ([APH ধারা ৪.২])।
২. **অনুষদ সদস্য দ্বৈত তালিকাভুক্তি:** একজন শিক্ষকের তথ্য অন্য প্রতিষ্ঠানেও বিদ্যমান ছিল ([APH ধারা ৭.১])।

#### করণীয় পদক্ষেপ:
- ইনস্টিটিউট ড্যাশবোর্ডে গিয়ে অবিলম্বে নবায়নের রসিদ বা নতুন সনদ আপলোড করুন।`,
        citations: ['APH 2026 ধারা ৭.১', 'APH 2026 ধারা ৪.২'],
        suggestedChips: ['ড্যাশবোর্ড খুলুন', 'নথি আপলোড করুন']
      };
    }

    // English
    return {
      reply: `### ⏱️ Application Status & Bottleneck Diagnostic
**Institution:** ${instName}
**Application Reference:** \`${appId}\`
**Current Workflow Stage:** **Stage 3 - Scrutiny (Deficiency Raised)**
**Assigned Scrutiny Officer:** Dr. Rajesh Sharma (RO Western Region)

#### Root Cause Analysis:
Your application is currently held in the **Deficiency Rectification Cycle** due to two flagged items:
1. **Fire NOC Expiry Proximity ([APH Clause 4.2]):** The Fire & Life Safety Certificate expires on 14-Nov-2026 (less than 30 days remaining in current academic approval cycle).
2. **Faculty Roll Cross-Check ([APH Clause 7.1]):** Cross-institution collision recorded for faculty relieving record.

#### Recommended Action:
- Head to the **Institute Dashboard > Document Management** tab.
- Click **Re-Upload / Replace** against the deficient Fire NOC to submit your renewal acknowledgement slip.
- Once updated, the application will advance directly to **Stage 5: Committee Review**.`,
      citations: ['APH 2026 Clause 4.2', 'APH 2026 Clause 7.1'],
      suggestedChips: ['Go to Institute Dashboard', 'Replace Deficient Document', 'View Compliance Breakdown']
    };
  }

  // 2. Document upload / Re-upload / Fire NOC / Verification
  if (
    lower.includes('document') || lower.includes('upload') || lower.includes('replace') ||
    lower.includes('noc') || lower.includes('deed') || lower.includes('दस्तावेज') ||
    lower.includes('कागदपत्र') || lower.includes('ஆவண') || lower.includes('নথি')
  ) {
    if (lang === 'hi') {
      return {
        reply: `### 📄 दस्तावेज़ प्रबंधन एवं सत्यापन प्रक्रिया
**एआईसीटीई अनुमोदन प्रक्रिया हैंडबुक (APH 2026) के दिशा-निर्देश:**

1. **दस्तावेज़ कैसे अपलोड करें:**
   - अपने **संस्थान डैशबोर्ड** पर जाएँ।
   - **"दस्तावेज़ प्रबंधन (Document Management)"** अनुभाग में **"+ नया दस्तावेज़ अपलोड करें"** बटन पर क्लिक करें।
   - दस्तावेज़ का प्रकार (जैसे: फायर एनओसी, भूमि विलेख, भवन पूर्णता प्रमाणपत्र) चुनें और वैध पीडीएफ फाइल संलग्न करें।

2. **अस्वीकृत या त्रुटिपूर्ण दस्तावेज़ बदलना (Re-upload / Replace):**
   - जिस दस्तावेज़ पर कमी (Deficiency/Rejected) दर्ज है, उसके सामने **"बदलें / पुनः अपलोड (Replace)"** बटन दबाएं।
   - नया संशोधित दस्तावेज़ अपलोड करते ही उसकी स्थिति स्वतः **Pending** हो जाएगी और संवीक्षा दल को पुनः सत्यापन हेतु प्रेषित कर दी जाएगी।
   - सभी पूर्व संस्करणों का विवरण **अपलोड इतिहास (History)** में सुरक्षित रहता है।`,
        citations: ['APH 2026 अध्याय 4', 'APH 2026 परिशिष्ट 2'],
        suggestedChips: ['संस्थान डैशबोर्ड खोलें', 'फायर एनओसी नियम', 'अनुपालन स्कोर देखें']
      };
    }

    if (lang === 'mr') {
      return {
        reply: `### 📄 कागदपत्र व्यवस्थापन व पडताळणी मार्गदर्शक
**एआयसीटीई हँडबुक (APH 2026) मार्गदर्शक तत्त्वे:**

१. **कागदपत्र कसे अपलोड करावे:**
   - **संस्था डॅशबोर्ड** वर जा.
   - **"कागदपत्र व्यवस्थापन"** विभागात **"+ नवीन कागदपत्र अपलोड करा"** बटनावर क्लिक करा.
   - प्रकार निवडा (अग्निशमन एनओसी, जमीन मालकी हक्क, इमारत पूर्णत्वाचे प्रमाणपत्र) आणि पीडीएफ जोडा.

२. **त्रुटी असलेले कागदपत्र बदलणे (Re-upload / Replace):**
   - नाकारलेल्या किंवा त्रुटी असलेल्या कागदपत्रासमोरील **"बदला (Replace)"** बटनावर क्लिक करा.
   - नवीन प्रत जोडल्यानंतर ते थेट **पडताळणी प्रलंबित (Pending)** स्थितीत जाते आणि अधिकारी त्याची पुन्हा तपासणी करतात.
   - प्रत्येक आवृत्तीची नोंद **इतिहास (Upload History)** मध्ये सुरक्षित राहते.`,
        citations: ['APH 2026 प्रकरण ४', 'APH 2026 परिशिष्ट २'],
        suggestedChips: ['संस्था डॅशबोर्ड पहा', 'कागदपत्रे अपलोड करा']
      };
    }

    // English
    return {
      reply: `### 📄 Document Scrutiny & Management Protocol
**Statutory Framework:** AICTE Approval Process Handbook (APH 2026 Chapter IV)

#### Mandatory Uploads for EoA & Course Additions:
1. **Fire & Life Safety Certificate (NOC) [APH Clause 4.2]:** Must be issued by competent Municipal/State Fire Services with minimum 60 days validity.
2. **Land Title & Registered Deed [APH Clause 8.1]:** Continuous land parcel registered in the name of the Trust/Society.
3. **Barrier-Free Divyangjan Audit [APH Clause 9.1]:** Accessible ramps, lifts, and braille signage audit report.
4. **Mandatory Disclosure [APH Clause 3.1]:** Published on the college official portal.

#### How to Replace Deficient Documents:
- In your **Institute Dashboard > Document Management** table, locate the item with status **Rejected** or **Needs Attention**.
- Click **Re-Upload / Replace**.
- Upload the renewal acknowledgement or clear 300 DPI scan.
- The status instantly updates to **Pending**, and the scrutiny committee is notified for immediate re-verification.`,
      citations: ['APH 2026 Clause 4.2', 'APH 2026 Clause 8.1', 'APH 2026 Clause 9.1'],
      suggestedChips: ['Open Institute Dashboard', 'Check Document History', 'View APH Safety Norms']
    };
  }

  // 3. Compliance score / Formula / FSR
  if (
    lower.includes('score') || lower.includes('compliance') || lower.includes('fsr') ||
    lower.includes('ratio') || lower.includes('स्कोर') || lower.includes('अनुपालन') ||
    lower.includes('गुण') || lower.includes('மதிப்பெண்')
  ) {
    const score = inst?.complianceScore || 96;

    if (lang === 'hi') {
      return {
        reply: `### 📊 व्याख्यात्मक अनुपालन स्कोर (Explainable Compliance Score)
**संस्थान:** ${inst?.name || 'College of Engineering, Pune'}
**वर्तमान समग्र स्कोर:** **${score} / 100** (स्थिति: ${score >= 80 ? '🟢 सुरक्षित / उत्कृष्ट (Low Risk)' : '🔴 सुधार आवश्यक (High Risk)'})

#### नियम-वार अंक विभाजन (APH 2026 Norms):
| वैधानिक नियम | APH खंड | मानक आवश्यकता | वर्तमान स्थिति | अंक प्रभाव |
| :--- | :--- | :--- | :--- | :--- |
| **शिक्षक-छात्र अनुपात (FSR)** | Clause 7.1 | 1:20 (B.Tech) | 1:19.4 | **+20 / 20** |
| **फायर एवं जीवन सुरक्षा** | Clause 4.2 | वैध > 60 दिन | 2027 तक वैध | **+15 / 15** |
| **अकादमिक निर्मित क्षेत्रफल** | Clause 8.3 | 4.5 वर्ग मी./छात्र | 5.2 वर्ग मी. | **+20 / 20** |
| **दिव्यांगजन सुलभता** | Clause 9.1 | रैंप व लिफ्ट 100% | पूर्णतः सत्यापित | **+15 / 15** |
| **अनिवार्य प्रकटीकरण (Disclosure)** | Clause 3.1 | वेबसाइट पर अद्यतन | ऑनलाइन सत्यापित | **+15 / 15** |
| **डिजिटल लाइब्रेरी / NDLI** | Clause 6.4 | 12 ई-जर्नल्स पैकेज | 18 पैकेज उपलब्ध | **+15 / 15** |

${score < 80 ? '⚠️ **स्कोर बढ़ाने के लिए सुझाव:** लंबित फायर एनओसी और फैकल्टी शपथ-पत्र शीघ्र जमा करें।' : '✅ आपका संस्थान एआईसीटीई के सभी मुख्य वैधानिक मानकों को पूर्ण करता है।' }`,
        citations: ['APH 2026 Clause 7.1', 'APH 2026 Clause 4.2', 'APH 2026 Clause 8.3'],
        suggestedChips: ['संस्थान डैशबोर्ड खोलें', 'दस्तावेज़ सत्यापित करें', 'नियम सिमुलेटर चलाएं']
      };
    }

    if (lang === 'mr') {
      return {
        reply: `### 📊 अनुपालन गुणसंख्या विश्लेषण (Compliance Score Diagnostic)
**संस्था:** ${inst?.name || 'अभियांत्रिकी महाविद्यालय, पुणे'}
**एकूण गुण:** **${score} / 100** (${score >= 80 ? '🟢 उत्कृष्ट दर्जा' : '🔴 सुधारणा आवश्यक'})

- **शिक्षक-विद्यार्थी प्रमाण (FSR - Clause 7.1):** १:२० निकषांची परिपूर्ण पूर्तता (+२० गुण).
- **अग्निशमन सुरक्षा प्रमाणपत्र (Clause 4.2):** वैध एनओसी उपलब्ध (+१५ गुण).
- **इमारत व प्रयोगशाळा क्षेत्र (Clause 8.3):** आवश्यकतेपेक्षा जास्त उपलब्ध (+२० गुण).
- **दिव्यांगजन सुविधा (Clause 9.1):** रॅम्प व व्हीलचेअर सुविधा (+१५ गुण).`,
        citations: ['APH 2026 कलम ७.१', 'APH 2026 कलम ४.२'],
        suggestedChips: ['संस्था डॅशबोर्ड', 'तपशील पहा']
      };
    }

    // English
    return {
      reply: `### 📊 Explainable Compliance Score Diagnostic
**Target Institution:** ${inst?.name || 'College of Engineering, Pune (COEP)'}
**Current Compliance Standing:** **${score} / 100** (Rating: ${score >= 80 ? '🟢 Tier-1 Low Risk (Optimal Approval Pathway)' : '🔴 Deficient / Scrutiny Attention Needed'})

#### Rule-by-Rule Scoring Breakdown:
- **Faculty Student Ratio [APH Clause 7.1]:** Target 1:20 (UG Engineering). Full statutory cadre ratio verified.
- **Fire & Life Safety [APH Clause 4.2]:** Valid Municipal NOC registered through academic year.
- **Instructional Area [APH Clause 8.3]:** Exceeds minimum 4.5 sq.m/student requirement.
- **Barrier-Free Divyangjan Access [APH Clause 9.1]:** Ramps, braille signage, and accessible facilities certified.
- **Mandatory Website Disclosure [APH Clause 3.1]:** Complete public audit available.`,
      citations: ['APH 2026 Clause 7.1', 'APH 2026 Clause 4.2', 'APH 2026 Clause 8.3'],
      suggestedChips: ['View Compliance Visibility', 'Inspect Verified Documents', 'Open Simulator']
    };
  }

  // 4. Default statutory co-pilot overview
  const welcomeReplies: Record<SupportedLanguage, string> = {
    en: `### 🤖 AICTE SmartApprove Statutory Assistant
I am your dedicated AI assistant for the **AICTE SmartApprove** portal, grounded in the **Approval Process Handbook (APH 2026)**.

**How I can assist your institution today:**
1. **Application Tracking:** Ask *"Why is my application stuck?"* to review real-time bottlenecks and SLA timers.
2. **Document Management:** Learn how to upload, replace, or re-verify statutory deeds and Fire NOCs.
3. **Compliance Score Diagnostic:** Understand your exact rule-by-rule points breakdown and what to fix first.
4. **Norms & Regulations:** Query faculty-to-student ratios, built-up area requirements, or inspection SOPs.`,
    hi: `### 🤖 एआईसीटीई स्मार्टअपरूव वैधानिक सहायक
मैं **एआईसीटीई स्मार्टअपरूव** का वैधानिक एआई सहायक हूँ, जो **अनुमोदन प्रक्रिया हैंडबुक (APH 2026)** के नियमों पर आधारित है।

**मैं आपकी क्या सहायता कर सकता हूँ:**
1. **आवेदन स्थिति:** पूछें *"मेरी अर्ज़ी क्यों रुकी है?"* और तुरंत रुकावट व समय-सीमा का विवरण पाएं।
2. **दस्तावेज़ प्रबंधन:** फायर एनओसी, भूमि विलेख और भवन प्रमाणपत्र अपलोड या पुनः सत्यापन के नियम जानें।
3. **अनुपालन स्कोर:** अपना 100 में से स्कोर और उसे सुधारने के उपाय समझें।
4. **एआईसीटीई नियम:** शिक्षक-छात्र अनुपात, प्रयोगशाला उपकरण एवं निरीक्षण मानकों पर सटीक जानकारी प्राप्त करें।`,
    mr: `### 🤖 एआयसीटीई स्मार्टअपरूव वैधानिक सह-पायलट
मी **एआयसीटीई मंजुरी प्रक्रिया हँडबुक (APH 2026)** नुसार मार्गदर्शन करणारा अधिकृत एआय सहाय्यक आहे.

**मी आपल्याला पुढील बाबींमध्ये मदत करू शकतो:**
१. **अर्जाची सद्यस्थिती:** *"माझा अर्ज का प्रलंबित आहे?"* विचारा आणि अडथळे जाणून घ्या.
२. **कागदपत्र व्यवस्थापन:** कागदपत्रे अपलोड करणे, त्रुटी बदलणे व पडताळणीचे नियम.
३. **अनुपालन गुणसंख्या:** आपल्या संस्थेचे गुण आणि निकषांची पूर्तता.
४. **वैधानिक नियम:** प्राध्यापक प्रमाण, अग्निशमन एनओसी व तपासणी कार्यपद्धती.`,
    ta: `### 🤖 AICTE SmartApprove சட்ட உதவியாளர்
நான் **AICTE ஒப்புதல் கையேடு (APH 2026)** விதிகளின்படி வழிகாட்டும் AI உதவியாளர்.

**எனது உதவிகள்:**
1. **விண்ணப்ப நிலை:** *"விண்ணப்பம் ஏன் நிலுவையில் உள்ளது?"* என்று கேட்டு காரணங்களை அறியலாம்.
2. **ஆவணங்கள்:** தீ பாதுகாப்பு மற்றும் நில ஆவணங்களை மறுபதிவேற்றம் செய்யும் வழிகாட்டுதல்.
3. **இணக்க மதிப்பெண்:** உங்கள் கல்லூரியின் மதிப்பெண் விவரங்கள்.`,
    bn: `### 🤖 AICTE SmartApprove বিধিবদ্ধ সহকারী
আমি **AICTE অনুমোদন নির্দেশিকা (APH 2026)** ভিত্তিক কৃত্রিম বুদ্ধিমত্তা চালিত সহকারী।

**আমি যেভাবে সাহায্য করতে পারি:**
১. **আবেদনের ট্র্যাকিং:** *"আমার আবেদন কেন আটকে আছে?"* জিজ্ঞাসা করে কারণ জানুন।
২. **নথি পরিচালনা:** ফায়ার এনওসি বা অন্যান্য নথি আপলোড ও প্রতিস্থাপনের নিয়মাবলী।
৩. **সম্মতি স্কোর:** আপনার প্রতিষ্ঠানের স্কোর বিশ্লেষণ ও উন্নতির পরামর্শ।`
  };

  return {
    reply: welcomeReplies[lang] || welcomeReplies.en,
    citations: ['APH 2026 Overview', 'AICTE Statutory Regulations'],
    suggestedChips: getSuggestedChips(lang)
  };
}
