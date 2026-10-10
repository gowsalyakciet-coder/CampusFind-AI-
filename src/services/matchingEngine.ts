/**
 * CampusFind AI - Matching Engine
 *
 * Compares lost and found reports according to the 8 system specifications:
 * 1. STRICT Category matching:
 *    - Laptop ONLY matches Laptop
 *    - Mobile Phone ONLY matches Mobile Phone
 *    - iPhone ONLY matches iPhone
 * 2. Brand & Model alignment
 * 3. Color & Identifying features
 * 4. Campus Location & Date proximity
 * 5. Honest labeling: 'AI Model (Gemini)' if backend AI is invoked,
 *    or 'Rule-Based Campus Similarity Engine' otherwise.
 */

import { ItemReport, MatchRecord, MatchDimension } from '../types';
import { dbService } from './database';

function calculateDaysDifference(date1Str: string, date2Str: string): number {
  try {
    const d1 = new Date(date1Str).getTime();
    const d2 = new Date(date2Str).getTime();
    return Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
  } catch {
    return 10;
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function computeTokenOverlap(textA: string, textB: string): number {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let common = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) common++;
  });

  const union = new Set([...tokensA, ...tokensB]).size;
  return Math.min(100, Math.round((common / union) * 150));
}

/**
 * Runs the deterministic rule-based campus similarity engine
 */
export function evaluateRuleBasedMatch(lost: ItemReport, found: ItemReport): MatchRecord | null {
  // STRICT CATEGORY FILTER: Incompatible categories never match
  if (lost.category !== found.category) {
    return null;
  }

  // 1. Category Compatibility (always 100% since types strictly match)
  const categoryDim: MatchDimension = {
    name: 'Category Compatibility',
    score: 100,
    weight: 25,
    details: `Strict ${lost.category} to ${found.category} verification.`
  };

  // 2. Brand & Model Alignment
  let brandScore = 40;
  const lostBrand = (lost.brand || '').toLowerCase().trim();
  const foundBrand = (found.brand || '').toLowerCase().trim();
  const lostModel = (lost.model || '').toLowerCase().trim();
  const foundModel = (found.model || '').toLowerCase().trim();

  if (lostBrand && foundBrand && (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))) {
    brandScore = 85;
  } else if (!lostBrand && !foundBrand) {
    brandScore = 60; // neutral
  }

  if (lostModel && foundModel) {
    const modelOverlap = computeTokenOverlap(lostModel, foundModel);
    brandScore = Math.max(brandScore, Math.min(100, brandScore + modelOverlap / 2));
  }

  const brandDim: MatchDimension = {
    name: 'Brand & Model Alignment',
    score: Math.min(100, Math.round(brandScore)),
    weight: 25,
    details: `${lost.brand || 'Unspecified'} ${lost.model || ''} vs ${found.brand || 'Unspecified'} ${found.model || ''}`
  };

  // 3. Color & Identifying Features
  let featureScore = 30;
  const lostColor = lost.color.toLowerCase();
  const foundColor = found.color.toLowerCase();
  if (lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
    featureScore += 35;
  }

  const descOverlap = computeTokenOverlap(
    lost.description + ' ' + lost.identifyingFeatures,
    found.description + ' ' + found.identifyingFeatures
  );
  featureScore = Math.min(100, featureScore + descOverlap);

  const featureDim: MatchDimension = {
    name: 'Color & Identifying Features',
    score: Math.min(100, Math.round(featureScore)),
    weight: 25,
    details: `Color match: "${lost.color}" & "${found.color}"; description signature overlap.`
  };

  // 4. Campus Location & Date Proximity
  let spatioScore = 30;
  if (lost.campusLocation.toLowerCase() === found.campusLocation.toLowerCase()) {
    spatioScore += 45;
  } else if (
    (lost.campusLocation.includes('Library') && found.campusLocation.includes('Library')) ||
    (lost.campusLocation.includes('Dining') && found.campusLocation.includes('Dining')) ||
    (lost.campusLocation.includes('Engineering') && found.campusLocation.includes('Engineering'))
  ) {
    spatioScore += 35;
  }

  const daysDiff = calculateDaysDifference(lost.date, found.date);
  if (daysDiff <= 1) {
    spatioScore += 25;
  } else if (daysDiff <= 3) {
    spatioScore += 18;
  } else if (daysDiff <= 7) {
    spatioScore += 10;
  }

  const spatioDim: MatchDimension = {
    name: 'Campus Spatiotemporal Proximity',
    score: Math.min(100, Math.round(spatioScore)),
    weight: 25,
    details: `${lost.campusLocation} vs ${found.campusLocation} (~${Math.round(daysDiff)} days apart).`
  };

  const totalScore = Math.round(
    (categoryDim.score * categoryDim.weight +
      brandDim.score * brandDim.weight +
      featureDim.score * featureDim.weight +
      spatioDim.score * spatioDim.weight) /
      100
  );

  let confidence: 'High' | 'Medium' | 'Low' = 'Low';
  if (totalScore >= 80) confidence = 'High';
  else if (totalScore >= 65) confidence = 'Medium';

  return {
    id: `match_${lost.id}_${found.id}`,
    lostItemId: lost.id,
    foundItemId: found.id,
    category: lost.category,
    score: totalScore,
    matchConfidence: confidence,
    matchEngine: 'Rule-Based Campus Similarity Engine',
    breakdown: [categoryDim, brandDim, featureDim, spatioDim],
    reasoning: `Rule-based assessment identified strong correlations in category (${lost.category}), brand (${lost.brand || 'N/A'}), and temporal proximity on campus.`,
    status: 'Unreviewed',
    createdAt: new Date().toISOString()
  };
}

/**
 * Executes matching for an item against all counterpart records in database
 */
export async function runMatchingForReport(item: ItemReport): Promise<MatchRecord[]> {
  const counterpartItems =
    item.type === 'lost'
      ? dbService.getFoundItems().filter((f) => f.status !== 'Returned')
      : dbService.getLostItems().filter((l) => l.status !== 'Returned');

  const newMatches: MatchRecord[] = [];

  for (const counterpart of counterpartItems) {
    const lost = item.type === 'lost' ? item : counterpart;
    const found = item.type === 'found' ? item : counterpart;

    // Must be same category
    if (lost.category !== found.category) continue;

    // Check if AI endpoint is available on /api/ai-match
    let matchRecord: MatchRecord | null = null;

    try {
      const response = await fetch('/api/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lostItem: lost, foundItem: found })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.matchRecord) {
          matchRecord = data.matchRecord;
        }
      }
    } catch {
      // Fallback silently to rule-based engine
    }

    if (!matchRecord) {
      matchRecord = evaluateRuleBasedMatch(lost, found);
    }

    // Only consider matches above threshold (e.g. 60%)
    if (matchRecord && matchRecord.score >= 60) {
      dbService.saveMatch(matchRecord);
      newMatches.push(matchRecord);

      // Create in-app notification for the lost item reporter
      dbService.createNotification({
        userId: lost.reportedByUserId,
        title: `Potential Match: ${matchRecord.score}% Score!`,
        message: `A found ${found.category} ("${found.title}") at ${found.campusLocation} closely matches your lost report.`,
        type: 'match',
        linkType: 'match',
        linkId: matchRecord.id
      });

      // Update statuses if currently Open
      if (lost.status === 'Open') {
        dbService.updateItemStatus(lost.id, 'Potential Match');
      }
      if (found.status === 'Open') {
        dbService.updateItemStatus(found.id, 'Potential Match');
      }
    }
  }

  return newMatches;
}
