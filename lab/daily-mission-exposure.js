// Daily exposure ledger: separate from mastery and review scheduling.
export const exposureKey=day=>`116.dailyMission.exposure.v1.${day}`;
export const questionId=q=>q.variantId||q.id;
export const coreId=q=>{const id=q.coreId||q.knowledgePointId;return id==='kp-black-family'?'kp-zi':id};
export function mergeExposure(ledger={},questions=[]){
 return {todaySeenQuestionIds:[...new Set([...(ledger.todaySeenQuestionIds||[]),...questions.map(questionId).filter(Boolean)])],todaySeenCoreIds:[...new Set([...(ledger.todaySeenCoreIds||[]),...questions.map(coreId).filter(Boolean)])]};
}
export function unseenQuestions(questions,ledger={}){
 const ids=new Set(ledger.todaySeenQuestionIds||[]),cores=new Set((ledger.todaySeenCoreIds||[]).map(core=>coreId({coreId:core})));
 return questions.filter(q=>!ids.has(questionId(q))&&!cores.has(coreId(q)));
}
export function uniqueCores(questions){const seen=new Set();return questions.filter(q=>{const id=coreId(q);if(seen.has(id))return false;seen.add(id);return true})}
