// Registry entries describe teaching strategies, independently of anime themes.
export const templateRegistry=new Map();
export function registerTemplate(definition){
 for(const key of ['templateId','name','questionTypes','errorTypes','requiredFields','components','mobilePresentation'])if(!definition[key])throw Error(`模板缺少 ${key}`);
 if(templateRegistry.has(definition.templateId))throw Error('重複模板：'+definition.templateId);
 templateRegistry.set(definition.templateId,definition);
}
const entries=[
 ['timeline','歷史時間軸與因果',['時序','歷史因果'],['事件先後混淆'],['events'],['時間節點','折疊解析'],'垂直時間線，逐點展開'],
 ['elimination','選項逐一排除',['選擇題','語境判斷'],['過度推論','詞義誤用'],['options','notes'],['選項按鈕','錯因提示'],'單欄選項，理由就近顯示'],
 ['evidence','閱讀證據與線索',['閱讀理解','語境填空'],['忽略證據'],['passage'],['證據標記'],'單欄可點選的證據句'],
 ['steps','逐步計算',['方程式','計算'],['步驟或符號錯誤'],['steps'],['步驟解鎖'],'每次展開一個步驟'],
 ['chart','圖表判讀',['數據比較'],['數值與差量混淆'],['values'],['互動長條','數值提示'],'單張自適應圖表與文字數值'],
 ['quick','關鍵字快問快答',['辨識','記憶'],['關鍵字不熟'],['question','options'],['可選倒數','即時回饋'],'倒數與作答同屏，不限制時間'],
 ['context-case','語境雙格填空',['語境填空'],['只檢查一格','望文生義'],['passage','fills'],['原文卡','答案代入'],'原文自動換行，解析在作答後揭曉'],
 ['transfer','相似變形題驗證',['遷移練習'],['只記答案'],['nextId'],['下一題導向'],'作答後顯示大尺寸挑戰按鈕']
];
for(const [templateId,name,questionTypes,errorTypes,requiredFields,components,mobilePresentation] of entries)registerTemplate({templateId,name,questionTypes,errorTypes,requiredFields,components,mobilePresentation});
export function validateLesson(q){
 for(const key of ['subject','errorType','questionType','coreConcept','learningAnalysis','primaryTemplate','supportTemplates','themeId'])if(q[key]===undefined)throw Error(`題目 ${q.id} 缺少 ${key}`);
 for(const id of [q.primaryTemplate,...q.supportTemplates]){
  const t=templateRegistry.get(id);if(!t)throw Error('未登錄模板：'+id);
  for(const field of t.requiredFields)if(q[field]===undefined)throw Error(`${q.id} 使用 ${id} 缺少 ${field}`);
 }
}
