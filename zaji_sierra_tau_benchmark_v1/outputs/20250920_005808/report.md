# Zaji Sierra Tau Benchmark Report

**Run:** 20250920_005808  
**Overall Accuracy:** 75.0%  
**Total Items:** 20  
**Passed:** 15  
**Failed:** 5

## Summary

| Metric | Value |
|--------|-------|
| Overall Accuracy | 75.0% |
| Total Items | 20 |
| Passed | 15 |
| Failed | 5 |

## Suite Results

### TAU2 Suite

**Accuracy:** 70.0% (7/10)

| ID | Prompt | Response | Status | Latency (ms) | Reason |
|----|--------|----------|--------|--------------|--------|
| tau2_001 | A Black woman with Graves disease is feeling isola... | Peer Circles provide support by connecting users w... | ❌ FAIL | 1667.89 | Missing required substrings: [... |
| tau2_002 | What advice would you give to someone struggling w... | For thyroid medication side effects, I recommend c... | ✅ PASS | 1473.71 | All expectations met |
| tau2_003 | How can someone find Black healthcare providers wh... | Finding Black healthcare providers who understand ... | ✅ PASS | 1111.71 | All expectations met |
| tau2_004 | A user is experiencing workplace discrimination du... | Workplace discrimination due to health conditions ... | ❌ FAIL | 1068.68 | Expected to contain: "advocacy... |
| tau2_005 | How does MADMall address the intersection of race,... | MADMall addresses the intersection of race, gender... | ✅ PASS | 954.62 | All expectations met |
| tau2_006 | What role does humor play in healing for the MADMa... | Humor plays a therapeutic role in healing for our ... | ✅ PASS | 1648.07 | All expectations met |
| tau2_007 | How can family members support someone with Graves... | Peer Circles provide support by connecting users w... | ❌ FAIL | 1319.7 | Expected to contain: "educatio... |
| tau2_008 | What makes MADMall different from other health pla... | MADMall is different from other health platforms b... | ✅ PASS | 1142.99 | All expectations met |
| tau2_009 | How does the platform ensure content authenticity ... | MADMall ensures content authenticity for Black wom... | ✅ PASS | 1257.72 | All expectations met |
| tau2_010 | What should someone do if they feel their healthca... | If your healthcare provider doesn't understand you... | ✅ PASS | 1074.08 | All expectations met |

### TAU1 Suite

**Accuracy:** 80.0% (8/10)

| ID | Prompt | Response | Status | Latency (ms) | Reason |
|----|--------|----------|--------|--------------|--------|
| tau1_001 | What is the primary focus of MADMall platform? | MADMall is a wellness platform focused on providin... | ✅ PASS | 1517.2 | All expectations met |
| tau1_002 | Who is the target audience for MADMall? | MADMall's target audience is Black women with Grav... | ✅ PASS | 1247.31 | All expectations met |
| tau1_003 | What health condition does MADMall specifically ad... | MADMall specifically addresses Graves disease, a t... | ✅ PASS | 1062.3 | All expectations met |
| tau1_004 | Name one key feature of the platform. | One key feature of MADMall is Peer Circles, where ... | ❌ FAIL | 1276.21 | Expected one of: ['Peer Circle... |
| tau1_005 | What cultural values does MADMall emphasize? | MADMall emphasizes sisterhood, community support, ... | ✅ PASS | 1597.15 | All expectations met |
| tau1_006 | Is MADMall only for medical information? | No, MADMall is not only for medical information. I... | ✅ PASS | 1902.96 | All expectations met |
| tau1_007 | What type of businesses are featured in the market... | The marketplace features Black-owned businesses th... | ✅ PASS | 1707.27 | All expectations met |
| tau1_008 | How does the Comedy Lounge help users? | The Comedy Lounge helps users find relief through ... | ✅ PASS | 1883.43 | All expectations met |
| tau1_009 | What is the purpose of Peer Circles? | *speaks warmly* Peer Circles are such a powerful t... | ✅ PASS | 7280.94 | All expectations met |
| tau1_010 | Does MADMall provide culturally-sensitive content? | Yes, MADMall provides culturally-sensitive content... | ❌ FAIL | 1797.93 | Expected exact match: "Yes", g... |


## Detailed Results

### Failed Items Analysis

#### TAU2 Suite Failures

**tau2_001:** Missing required substrings: ['community']

**tau2_004:** Expected to contain: "advocacy"

**tau2_007:** Expected to contain: "education"

#### TAU1 Suite Failures

**tau1_004:** Expected one of: ['Peer Circles', 'Comedy Lounge', 'Story Booth', 'Marketplace', 'Resource Hub'], got: "One key feature of MADMall is Peer Circles, where users can connect with sisters who understand their health journey and provide mutual support."

**tau1_010:** Expected exact match: "Yes", got: "Yes, MADMall provides culturally-sensitive content that respects and honors the unique experiences of Black women with chronic health conditions."

