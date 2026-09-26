const BASE='/lab/assets/daily-mission/generic';

export const GENERIC_MISSION_IMAGES=Object.freeze({
 default:`${BASE}/anya-reading-card.png`,
 pronunciation:`${BASE}/anya-listening.png`,
 shape:`${BASE}/anya-magnifier.png`,
 meaning:`${BASE}/anya-thinking.png`,
 confusable:`${BASE}/anya-compare.png`,
 review:`${BASE}/anya-note-check.png`,
 correct:`${BASE}/anya-correct.png`,
 hint:`${BASE}/anya-hint.png`,
 trap:`${BASE}/anya-alert.png`,
 warmup:`${BASE}/anya-mission-start.png`
});

export const SAFE_MISSION_IMAGE='/themes/spy-family-art.png';

export function genericImageKey(question={},missionRole=''){
 if(question.visualType&&GENERIC_MISSION_IMAGES[question.visualType])return question.visualType;
 if(missionRole.includes('混淆'))return 'confusable';
 if(missionRole.includes('複習'))return 'review';
 if(missionRole.includes('暖身'))return 'warmup';
 if(question.type&&GENERIC_MISSION_IMAGES[question.type])return question.type;
 if(question.kind==='字音')return 'pronunciation';
 if(question.kind==='字形')return 'shape';
 if(question.kind==='字義')return 'meaning';
 if(question.type==='polyphone')return 'pronunciation';
 if(question.type==='polysemy')return 'meaning';
 return 'default';
}

export function resolveMissionImage(question={},missionRole=''){
 return question.specificImage||question.image||GENERIC_MISSION_IMAGES[genericImageKey(question,missionRole)]||GENERIC_MISSION_IMAGES.default||SAFE_MISSION_IMAGE;
}
