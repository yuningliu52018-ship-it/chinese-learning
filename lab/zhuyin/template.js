import {registerTemplate} from '../templates.js';
registerTemplate({templateId:'zhuyin-memory',name:'漫畫圖解記憶牆',questionTypes:['字音','字形'],errorTypes:['聲調混淆','字形混淆'],requiredFields:['prompt','answer','lockedSourceText','word','sound','meaning','explanation','illustration'],components:['核心字音','字詞解義','鎖定原題','輔助漫畫','逐字驗證'],mobilePresentation:'390px 單欄，24px 原題置頂，其次核心字音、18px 字義，最後112px 輔助漫畫'});
export const templateId='zhuyin-memory';
