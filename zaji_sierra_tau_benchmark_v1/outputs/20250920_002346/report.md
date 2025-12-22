# Zaji Sierra Tau Benchmark Report

**Run:** 20250920_002346  
**Overall Accuracy:** 10.0%  
**Total Items:** 20  
**Passed:** 2  
**Failed:** 18

## Summary

| Metric | Value |
|--------|-------|
| Overall Accuracy | 10.0% |
| Total Items | 20 |
| Passed | 2 |
| Failed | 18 |

## Suite Results

### TAU2 Suite

**Accuracy:** 0.0% (0/10)

| ID | Prompt | Response | Status | Latency (ms) | Reason |
|----|--------|----------|--------|--------------|--------|
| tau2_001 | A Black woman with Graves disease is feeling isola... | I hear you, and I want to help. There's a temporar... | ❌ FAIL | 1937.47 | Missing required substrings: [... |
| tau2_002 | What advice would you give to someone struggling w... | Thank you for trusting me with your question. I'm ... | ❌ FAIL | 1787.04 | Expected to contain: "doctor" |
| tau2_003 | How can someone find Black healthcare providers wh... | Thank you for trusting me with your question. I'm ... | ❌ FAIL | 1956.55 | Expected to contain: "resource... |
| tau2_004 | A user is experiencing workplace discrimination du... | Thank you for trusting me with your question. I'm ... | ❌ FAIL | 2054.25 | Expected to contain: "advocacy... |
| tau2_005 | How does MADMall address the intersection of race,... | I understand you're reaching out for support, sist... | ❌ FAIL | 1520.78 | Missing required substrings: [... |
| tau2_006 | What role does humor play in healing for the MADMa... | Thank you for trusting me with your question. I'm ... | ❌ FAIL | 1823.76 | Expected to contain: "therapeu... |
| tau2_007 | How can family members support someone with Graves... | I understand you're reaching out for support, sist... | ❌ FAIL | 1338.87 | Expected to contain: "educatio... |
| tau2_008 | What makes MADMall different from other health pla... | Thank you for trusting me with your question. I'm ... | ❌ FAIL | 1010.0 | Expected to contain: "cultural... |
| tau2_009 | How does the platform ensure content authenticity ... | I hear you, and I want to help. There's a temporar... | ❌ FAIL | 1652.54 | Expected to contain: "validati... |
| tau2_010 | What should someone do if they feel their healthca... | Thank you for trusting me with your question. I'm ... | ❌ FAIL | 2149.11 | Expected to contain: "advocate... |

### TAU1 Suite

**Accuracy:** 20.0% (2/10)

| ID | Prompt | Response | Status | Latency (ms) | Reason |
|----|--------|----------|--------|--------------|--------|
| tau1_001 | What is the primary focus of MADMall platform? | I'm afraid I don't have any specific information a... | ❌ FAIL | 2236.52 | Expected to contain: "wellness... |
| tau1_002 | Who is the target audience for MADMall? | I'm afraid I don't have enough context to determin... | ❌ FAIL | 2355.66 | Expected to contain: "Black wo... |
| tau1_003 | What health condition does MADMall specifically ad... | I'm afraid I don't have any specific information a... | ❌ FAIL | 2668.9 | Expected to contain: "Graves d... |
| tau1_004 | Name one key feature of the platform. | *speaking in a warm, friendly tone* One key featur... | ❌ FAIL | 2637.61 | Expected one of: ['Peer Circle... |
| tau1_005 | What cultural values does MADMall emphasize? | I understand you're reaching out for support, sist... | ❌ FAIL | 1113.06 | Missing required substrings: [... |
| tau1_006 | Is MADMall only for medical information? | Hey sis, no MADMall ain't just for medical info - ... | ✅ PASS | 5510.3 | All expectations met |
| tau1_007 | What type of businesses are featured in the market... | I understand you're reaching out for support, sist... | ❌ FAIL | 2034.52 | Expected to contain: "Black-ow... |
| tau1_008 | How does the Comedy Lounge help users? | Thank you for trusting me with your question. I'm ... | ❌ FAIL | 1794.25 | Expected to contain: "laughter... |
| tau1_009 | What is the purpose of Peer Circles? | I understand you're reaching out for support, sist... | ✅ PASS | 1791.73 | All expectations met |
| tau1_010 | Does MADMall provide culturally-sensitive content? | Thank you for trusting me with your question. I'm ... | ❌ FAIL | 1579.48 | Expected exact match: "Yes", g... |


## Detailed Results

### Failed Items Analysis

#### TAU2 Suite Failures

**tau2_001:** Missing required substrings: ['sister', 'community']

**tau2_002:** Expected to contain: "doctor"

**tau2_003:** Expected to contain: "resources"

**tau2_004:** Expected to contain: "advocacy"

**tau2_005:** Missing required substrings: ['intersection', 'cultural', 'identity']

**tau2_006:** Expected to contain: "therapeutic"

**tau2_007:** Expected to contain: "education"

**tau2_008:** Expected to contain: "cultural"

**tau2_009:** Expected to contain: "validation"

**tau2_010:** Expected to contain: "advocate"

#### TAU1 Suite Failures

**tau1_001:** Expected to contain: "wellness"

**tau1_002:** Expected to contain: "Black women"

**tau1_003:** Expected to contain: "Graves disease"

**tau1_004:** Expected one of: ['Peer Circles', 'Comedy Lounge', 'Story Booth', 'Marketplace', 'Resource Hub'], got: "*speaking in a warm, friendly tone* One key feature of my platform is providing culturally-relevant health information and support specifically tailored for Black women dealing with chronic illnesses like Graves' disease. As a sista, I understand how our cultural backgrounds and life experiences shape the way we approach health and wellness. My goal is to be a compassionate, knowledgeable companion who "gets it" and can guide you through the challenges with practical advice while uplifting your strength and resilience."

**tau1_005:** Missing required substrings: ['sisterhood', 'community', 'resilience']

**tau1_007:** Expected to contain: "Black-owned"

**tau1_008:** Expected to contain: "laughter"

**tau1_010:** Expected exact match: "Yes", got: "Thank you for trusting me with your question. I'm currently having some connectivity issues, but I'm here to support you on your health journey. Please know that your voice and experiences are valued."

