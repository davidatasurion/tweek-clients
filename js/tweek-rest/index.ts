/// <reference path="./node_modules/@types/isomorphic-fetch/index.d.ts"/>

export type Identity = {
    type:string;
    id?:string;
}

export type IdentityContext = Identity & {
    [prop:string]:string;
}

export type TweekCasing = "snake" | "camelCase";

export type TweekConfig = {
    casing: TweekCasing;
    convertTyping: boolean;
    flatten: boolean;
    context:IdentityContext[];
}

export type TweekInitConfig = Partial<TweekConfig> & {
    baseServiceUrl:string;
    restGetter: <T>(url)=>Promise<T>;
}

export type TweekFullConfig = TweekConfig & TweekInitConfig;

function captialize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function snakeToCamelCase(target){
    if (typeof(target) !== "object") return target;
       return Object.keys(target).reduce((o, key) => {
         let [firstKey, ...others] = key.split("_");
         let newKey = [firstKey, ...others.map(captialize)].join("");
         o[newKey] = snakeToCamelCase(target[key]);
         return o;
       },{});
    
}

function convertTypingFromJSON(target){
    if (typeof(target) === "string"){
      try {
        return JSON.parse(target);
      } catch (e) {
        return target;
      }
    }
    if (typeof(target) === "object"){
       return Object.keys(target).reduce((o, key) => {
         o[key] = convertTypingFromJSON(target[key]);
         return o;
       },{});
    }
}

function encodeContextUri(context:IdentityContext){
    return [ ...(context.id ? [`${context.type}=${context.id}`] : []) , ...Object.keys(context).filter(x=> x!== "id" && x!== "type")
                                                .map(prop=> `${context.type}.${prop}=${context[prop]}`)].join("&")
}

export default class TweekClient { 
    config:TweekFullConfig;
    
    constructor(config:TweekInitConfig)
    {
        this.config = <TweekFullConfig>{...{camelCase:"snake", flatten:false, convertTyping:false, context:[]}, ...config};
    }
    
    fetch<T>(path:string, _config?: Partial<TweekConfig> ):Promise<T>{
      const {casing, flatten, baseServiceUrl, restGetter, convertTyping, context} = <TweekFullConfig>{...this.config, ..._config};
      let url = `${baseServiceUrl}/${path}?` + context.map(encodeContextUri).join("&");
      if (flatten){
          url += "$flatten=true"
      }
      let result = restGetter<any>(url);

      if (!flatten && casing === "camelCase" ){
          result = result.then(snakeToCamelCase);
      }
      if (convertTyping){
          result = result.then(convertTypingFromJSON);
      }
      return <Promise<T>>result;
    }
}

export function createTweekClient(baseServiceUrl:string, ...context:IdentityContext[]){
    return new TweekClient({baseServiceUrl, 
        casing:"camelCase", 
        convertTyping:true,
        context,
        restGetter: <T>(url)=>fetch(url).then(x=>x.json<T>())});
}
