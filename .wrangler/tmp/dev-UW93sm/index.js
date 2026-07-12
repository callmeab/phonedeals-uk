var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-0wh7Pw/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-0wh7Pw/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// worker/node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// worker/node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// worker/node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// worker/node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// worker/node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// worker/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// worker/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
}, "Context");

// worker/node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// worker/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// worker/node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono");

// worker/node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// worker/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node");

// worker/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// worker/node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// worker/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// worker/node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = /* @__PURE__ */ __name(class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node");

// worker/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// worker/node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// worker/src/utils/jwt.ts
function base64UrlEncode(buffer) {
  let bytes;
  if (typeof buffer === "string") {
    bytes = new TextEncoder().encode(buffer);
  } else {
    bytes = new Uint8Array(buffer);
  }
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.slice(i, i + chunk)));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64UrlEncode, "base64UrlEncode");
function base64UrlDecode(str) {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) {
    b64 += "=";
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(base64UrlDecode, "base64UrlDecode");
async function signJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataToSign)
  );
  const signatureEncoded = base64UrlEncode(signature);
  return `${dataToSign}.${signatureEncoded}`;
}
__name(signJWT, "signJWT");
async function verifyJWT(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3)
      return null;
    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
    const dataToVerify = `${headerEncoded}.${payloadEncoded}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signatureBytes = base64UrlDecode(signatureEncoded);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(dataToVerify)
    );
    if (!isValid)
      return null;
    const payloadBytes = base64UrlDecode(payloadEncoded);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}
__name(verifyJWT, "verifyJWT");

// worker/src/middleware/auth.ts
async function authMiddleware(c, next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ success: false, error: "Unauthorized: Missing or invalid Authorization header" }, 401);
  }
  const token = authHeader.split(" ")[1];
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ success: false, error: "Unauthorized: Invalid or expired token" }, 401);
  }
  c.set("adminUser", payload);
  await next();
}
__name(authMiddleware, "authMiddleware");

// worker/src/routes/auth.ts
var authRouter = new Hono2();
async function verifyPassword(password, storedHashString) {
  try {
    const parts = storedHashString.split(":");
    if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") {
      return false;
    }
    const iterations = parseInt(parts[2], 10);
    const saltBytes = base64UrlDecode(parts[3]);
    const storedHashBytes = base64UrlDecode(parts[4]);
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations,
        hash: "SHA-256"
      },
      passwordKey,
      256
      // 32 bytes output
    );
    const hashBytes = new Uint8Array(hashBuffer);
    if (hashBytes.length !== storedHashBytes.length)
      return false;
    let mismatch = 0;
    for (let i = 0; i < hashBytes.length; i++) {
      mismatch |= hashBytes[i] ^ storedHashBytes[i];
    }
    return mismatch === 0;
  } catch (e) {
    return false;
  }
}
__name(verifyPassword, "verifyPassword");
authRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    if (!body || !body.email || !body.password) {
      return c.json({ success: false, error: "Missing email or password" }, 400);
    }
    const db = c.env.DB;
    const user = await db.prepare("SELECT id, email, password_hash FROM admins WHERE email = ?").bind(body.email).first();
    if (!user) {
      return c.json({ success: false, error: "Invalid credentials" }, 401);
    }
    if (user.password_hash === "PLACEHOLDER_HASH_REPLACE_ME") {
      return c.json({ success: false, error: "Admin account not fully setup (Hash is still a placeholder)" }, 401);
    }
    const isMatch = await verifyPassword(body.password, user.password_hash);
    if (!isMatch) {
      return c.json({ success: false, error: "Invalid credentials" }, 401);
    }
    const now = Math.floor(Date.now() / 1e3);
    const exp = now + 8 * 60 * 60;
    const payload = {
      sub: user.id,
      email: user.email,
      iat: now,
      exp
    };
    const token = await signJWT(payload, c.env.JWT_SECRET);
    return c.json({
      success: true,
      token,
      expiresAt: new Date(exp * 1e3).toISOString()
    });
  } catch (e) {
    return c.json({ success: false, error: "Invalid request" }, 400);
  }
});
var auth_default = authRouter;

// worker/src/routes/admin-stats.ts
var statsRouter = new Hono2();
statsRouter.get("/dashboard-stats", async (c) => {
  try {
    const db = c.env.DB;
    const results = await db.batch([
      db.prepare("SELECT COUNT(*) as total FROM products"),
      db.prepare("SELECT COUNT(*) as active FROM products WHERE is_active = 1"),
      db.prepare("SELECT COUNT(*) as total FROM deals"),
      db.prepare("SELECT COUNT(*) as active FROM deals WHERE is_active = 1"),
      db.prepare('SELECT COUNT(*) as count FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name LIKE "%iPhone%" OR c.slug LIKE "%iphone%"'),
      db.prepare('SELECT COUNT(*) as count FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name LIKE "%Samsung%" OR c.slug LIKE "%samsung%"'),
      db.prepare(`
        SELECT p.id, p.name, p.is_active, p.created_at, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC 
        LIMIT 5
      `)
    ]);
    const totalProducts = results[0].results[0]?.total || 0;
    const activeProducts = results[1].results[0]?.active || 0;
    const totalDeals = results[2].results[0]?.total || 0;
    const activeDeals = results[3].results[0]?.active || 0;
    const iPhoneProducts = results[4].results[0]?.count || 0;
    const samsungProducts = results[5].results[0]?.count || 0;
    const recentProducts = results[6].results || [];
    return c.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalDeals,
        activeDeals,
        iPhoneProducts,
        samsungProducts,
        recentProducts
      }
    });
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
    return c.json({ success: false, error: "Failed to load dashboard stats" }, 500);
  }
});
var admin_stats_default = statsRouter;

// worker/src/utils/slugify.ts
function slugify(text) {
  if (!text)
    return "";
  return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}
__name(slugify, "slugify");

// worker/src/utils/validate.ts
var ValidationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
};
__name(ValidationError, "ValidationError");
var validate = {
  required: (value, fieldName) => {
    if (value === void 0 || value === null || String(value).trim() === "") {
      throw new ValidationError(`${fieldName} is required`);
    }
  },
  maxLength: (value, max, fieldName) => {
    if (value && String(value).length > max) {
      throw new ValidationError(`${fieldName} must be less than ${max} characters`);
    }
  },
  isValidSlug: (value) => {
    if (!value)
      return false;
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(value);
  },
  isAdult: (dateOfBirthISO) => {
    if (!dateOfBirthISO)
      return false;
    const dob = new Date(dateOfBirthISO);
    if (isNaN(dob.getTime()))
      return false;
    const today = /* @__PURE__ */ new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || m === 0 && today.getDate() < dob.getDate()) {
      age--;
    }
    return age >= 18;
  },
  isValidUKMobile: (value) => {
    if (!value)
      return false;
    const stripped = value.replace(/[\s-]/g, "");
    const regex = /^(?:0|\+44)7\d{9}$/;
    return regex.test(stripped);
  }
};

// worker/src/utils/image-url.ts
function buildPublicImageUrl(requestUrl, key, r2PublicUrl) {
  if (r2PublicUrl) {
    return `${r2PublicUrl.replace(/\/$/, "")}/${key}`;
  }
  return `/api/images/${key}`;
}
__name(buildPublicImageUrl, "buildPublicImageUrl");
function normalizeImageUrl(storedUrl, requestUrl, r2PublicUrl) {
  if (!storedUrl)
    return null;
  if (r2PublicUrl && storedUrl.startsWith(r2PublicUrl.replace(/\/$/, ""))) {
    return storedUrl;
  }
  if (storedUrl.startsWith("https://")) {
    return storedUrl;
  }
  if (storedUrl.includes("/api/images/")) {
    if (!r2PublicUrl && (storedUrl.includes("localhost") || storedUrl.includes("127.0.0.1"))) {
      const idx = storedUrl.indexOf("/api/images/");
      return storedUrl.slice(idx);
    }
    return storedUrl;
  }
  const productsIdx = storedUrl.indexOf("products/");
  if (productsIdx !== -1) {
    const key = storedUrl.slice(productsIdx);
    return buildPublicImageUrl(requestUrl, key, r2PublicUrl);
  }
  if (storedUrl.startsWith("products/")) {
    return buildPublicImageUrl(requestUrl, storedUrl, r2PublicUrl);
  }
  return storedUrl;
}
__name(normalizeImageUrl, "normalizeImageUrl");
function normalizeProductImages(product, requestUrl, r2PublicUrl) {
  const normalized = {
    ...product
  };
  if (product.variants) {
    try {
      const variants = JSON.parse(product.variants);
      normalized.variants = JSON.stringify(
        variants.map((v) => ({
          ...v,
          images: (v.images || []).map((imgUrl) => normalizeImageUrl(imgUrl, requestUrl, r2PublicUrl))
        }))
      );
    } catch {
    }
  }
  return normalized;
}
__name(normalizeProductImages, "normalizeProductImages");

// worker/src/routes/products.ts
var publicProductsRouter = new Hono2();
var adminProductsRouter = new Hono2();
publicProductsRouter.get("/", async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const categorySlug = url.searchParams.get("category");
    const isFeatured = url.searchParams.get("featured") === "true";
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    let baseQuery = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];
    if (categorySlug) {
      baseQuery += ` AND c.slug = ?`;
      params.push(categorySlug);
    }
    if (isFeatured) {
      baseQuery += ` AND p.is_featured = 1`;
    }
    const countResult = await db.prepare(`SELECT COUNT(*) as total ${baseQuery}`).bind(...params).first();
    const total = countResult?.total || 0;
    const dataQuery = `
      SELECT p.*, c.name as category_name
      ${baseQuery}
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
    const { results } = await db.prepare(dataQuery).bind(...params).all();
    const requestUrl = c.req.url;
    const publicR2Domain = c.env.R2_PUBLIC_URL;
    const normalized = results.map((p) => normalizeProductImages(p, requestUrl, publicR2Domain));
    const page = Math.floor(offset / limit) + 1;
    return c.json({
      success: true,
      data: normalized,
      total,
      page,
      limit
    });
  } catch (err) {
    console.error("Fetch public products error:", err);
    return c.json({ success: false, error: "Failed to fetch products" }, 500);
  }
});
publicProductsRouter.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const product = await c.env.DB.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = ? AND p.is_active = 1
    `).bind(slug).first();
    if (!product)
      return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({
      success: true,
      data: normalizeProductImages(product, c.req.url, c.env.R2_PUBLIC_URL)
    });
  } catch (err) {
    return c.json({ success: false, error: "Failed to fetch product" }, 500);
  }
});
adminProductsRouter.get("/", async (c) => {
  try {
    const url = new URL(c.req.url);
    const search = url.searchParams.get("search");
    const categoryId = url.searchParams.get("category_id");
    const isActive = url.searchParams.get("is_active");
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      query += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }
    if (categoryId) {
      query += ` AND p.category_id = ?`;
      params.push(categoryId);
    }
    if (isActive !== null) {
      query += ` AND p.is_active = ?`;
      params.push(isActive === "true" || isActive === "1" ? 1 : 0);
    }
    query += ` ORDER BY p.created_at DESC`;
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    const requestUrl = c.req.url;
    const publicR2Domain = c.env.R2_PUBLIC_URL;
    const normalized = results.map((p) => normalizeProductImages(p, requestUrl, publicR2Domain));
    return c.json({ success: true, data: normalized });
  } catch (err) {
    return c.json({ success: false, error: "Failed to fetch admin products" }, 500);
  }
});
adminProductsRouter.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await c.env.DB.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).bind(id).first();
    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    return c.json({
      success: true,
      data: normalizeProductImages(product, c.req.url, c.env.R2_PUBLIC_URL)
    });
  } catch (err) {
    return c.json({ success: false, error: "Failed to fetch product" }, 500);
  }
});
adminProductsRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    validate.required(body.name, "Name");
    validate.required(body.category_id, "Category ID");
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);
    validate.required(slug, "Slug");
    if (!validate.isValidSlug(slug)) {
      throw new ValidationError("Invalid slug format. Use lowercase alphanumeric characters and hyphens.");
    }
    const db = c.env.DB;
    const existing = await db.prepare("SELECT id FROM products WHERE slug = ?").bind(slug).first();
    if (existing) {
      return c.json({ success: false, error: "Product slug already exists" }, 409);
    }
    const result = await db.prepare(`
      INSERT INTO products (
        category_id, name, slug, description, storage_options, colours,
        sim_types, variants, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      body.category_id,
      body.name,
      slug,
      body.description || null,
      body.storage_options ? JSON.stringify(body.storage_options) : null,
      body.colours ? JSON.stringify(body.colours) : null,
      body.sim_types ? JSON.stringify(body.sim_types) : null,
      body.variants ? JSON.stringify(body.variants) : null,
      body.is_featured ? 1 : 0,
      body.is_active !== void 0 ? body.is_active ? 1 : 0 : 1
    ).first();
    return c.json({
      success: true,
      data: normalizeProductImages(result, c.req.url, c.env.R2_PUBLIC_URL)
    }, 201);
  } catch (err) {
    if (err instanceof ValidationError) {
      return c.json({ success: false, error: err.message }, 400);
    }
    return c.json({ success: false, error: "Failed to create product" }, 500);
  }
});
adminProductsRouter.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = c.env.DB;
    const current = await db.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
    if (!current) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    let slug = current.slug;
    if (body.slug) {
      slug = slugify(body.slug);
      if (!validate.isValidSlug(slug))
        throw new ValidationError("Invalid slug format");
      const existing = await db.prepare("SELECT id FROM products WHERE slug = ? AND id != ?").bind(slug, id).first();
      if (existing)
        return c.json({ success: false, error: "Slug already in use by another product" }, 409);
    }
    const updates = [];
    const params = [];
    const addUpdate = /* @__PURE__ */ __name((field, val) => {
      updates.push(`${field} = ?`);
      params.push(val);
    }, "addUpdate");
    if (body.category_id !== void 0)
      addUpdate("category_id", body.category_id);
    if (body.name !== void 0)
      addUpdate("name", body.name);
    addUpdate("slug", slug);
    if (body.description !== void 0)
      addUpdate("description", body.description);
    if (body.storage_options !== void 0) {
      addUpdate("storage_options", typeof body.storage_options === "string" ? body.storage_options : JSON.stringify(body.storage_options));
    }
    if (body.colours !== void 0) {
      addUpdate("colours", typeof body.colours === "string" ? body.colours : JSON.stringify(body.colours));
    }
    if (body.sim_types !== void 0) {
      addUpdate("sim_types", typeof body.sim_types === "string" ? body.sim_types : JSON.stringify(body.sim_types));
    }
    if (body.variants !== void 0) {
      addUpdate("variants", typeof body.variants === "string" ? body.variants : JSON.stringify(body.variants));
    }
    if (body.is_featured !== void 0)
      addUpdate("is_featured", body.is_featured ? 1 : 0);
    if (body.is_active !== void 0)
      addUpdate("is_active", body.is_active ? 1 : 0);
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    const query = `UPDATE products SET ${updates.join(", ")} WHERE id = ? RETURNING *`;
    params.push(id);
    const updated = await db.prepare(query).bind(...params).first();
    return c.json({
      success: true,
      data: normalizeProductImages(updated, c.req.url, c.env.R2_PUBLIC_URL)
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return c.json({ success: false, error: err.message }, 400);
    }
    return c.json({ success: false, error: "Failed to update product" }, 500);
  }
});
adminProductsRouter.delete("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const db = c.env.DB;
    const dealsResult = await db.prepare("DELETE FROM deals WHERE product_id = ?").bind(id).run();
    const productResult = await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    console.log("Delete Product ID", id, "deals result:", dealsResult, "product result:", productResult);
    if (!productResult.success)
      return c.json({ success: false, error: "Failed to delete product" }, 500);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: "Internal error during deletion" }, 500);
  }
});

// worker/src/routes/admin-upload.ts
var uploadRouter = new Hono2();
var uploadHandler = /* @__PURE__ */ __name(async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file) {
      console.warn("Upload attempt without a file in the payload");
      return c.json({ success: false, error: "No file provided" }, 400);
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.warn(`Upload rejected: File size ${file.size} exceeds 5MB limit`);
      return c.json({ success: false, error: "File size exceeds 5MB limit" }, 400);
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      console.warn(`Upload rejected: Invalid file type ${file.type}`);
      return c.json({ success: false, error: "Invalid file format. Supported: JPEG, PNG, WEBP, GIF" }, 400);
    }
    const providedKey = body["key"];
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const key = providedKey && /^products\/[\w.\-]+$/.test(providedKey) ? providedKey : `products/${timestamp}-${cleanName}`;
    console.log(`Uploading file ${file.name} to R2 bucket at key ${key}...`);
    await c.env.IMAGES.put(key, file, {
      httpMetadata: {
        contentType: file.type
      }
    });
    console.log(`Successfully uploaded ${key} to R2 bucket.`);
    const publicUrl = buildPublicImageUrl(c.req.url, key, c.env.R2_PUBLIC_URL);
    return c.json({
      success: true,
      data: {
        key,
        publicUrl
      }
    });
  } catch (err) {
    console.error("Upload Error:", err);
    return c.json({
      success: false,
      error: "Failed to upload image",
      details: err instanceof Error ? err.message : String(err)
    }, 500);
  }
}, "uploadHandler");
uploadRouter.post("/", uploadHandler);
uploadRouter.post("", uploadHandler);
var admin_upload_default = uploadRouter;

// worker/src/routes/deals.ts
var publicDealsRouter = new Hono2();
var adminDealsRouter = new Hono2();
var NETWORKS = ["EE", "O2", "Vodafone", "Three", "Sky Mobile", "iD Mobile", "BT Mobile"];
var CONTRACTS = [12, 24, 36];
publicDealsRouter.get("/", async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const productId = url.searchParams.get("product_id");
    if (!productId) {
      return c.json({ success: false, error: "product_id query param is required" }, 400);
    }
    const { results } = await db.prepare(`
      SELECT d.*, p.name as product_name
      FROM deals d
      JOIN products p ON d.product_id = p.id
      WHERE d.product_id = ? AND d.is_active = 1
      ORDER BY d.monthly_cost ASC
    `).bind(productId).all();
    return c.json({ success: true, data: results });
  } catch (err) {
    return c.json({ success: false, error: "Failed to fetch public deals" }, 500);
  }
});
adminDealsRouter.get("/", async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const productId = url.searchParams.get("product_id");
    if (!productId) {
      return c.json({ success: false, error: "product_id query param is required" }, 400);
    }
    const { results } = await db.prepare(`
      SELECT d.*, p.name as product_name
      FROM deals d
      JOIN products p ON d.product_id = p.id
      WHERE d.product_id = ?
      ORDER BY d.sort_order ASC, d.monthly_cost ASC
    `).bind(productId).all();
    return c.json({ success: true, data: results });
  } catch (err) {
    return c.json({ success: false, error: "Failed to fetch admin deals" }, 500);
  }
});
adminDealsRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    validate.required(body.product_id, "Product ID");
    validate.required(body.network, "Network");
    if (!NETWORKS.includes(body.network))
      throw new ValidationError(`Invalid network. Must be one of: ${NETWORKS.join(", ")}`);
    validate.required(body.contract_months, "Contract Months");
    if (!CONTRACTS.includes(Number(body.contract_months)))
      throw new ValidationError("Invalid contract_months. Must be 12, 24, or 36");
    validate.required(body.monthly_cost, "Monthly Cost");
    if (Number(body.monthly_cost) <= 0)
      throw new ValidationError("Monthly cost must be > 0");
    validate.required(body.data_gb, "Data GB");
    const minutes = body.minutes !== void 0 ? Number(body.minutes) : 9999;
    const texts = body.texts !== void 0 ? Number(body.texts) : 9999;
    const upfront = body.upfront_cost ? Number(body.upfront_cost) : 0;
    let highlights = null;
    if (body.deal_highlights && Array.isArray(body.deal_highlights)) {
      if (body.deal_highlights.length > 4)
        throw new ValidationError("Max 4 deal highlights allowed");
      highlights = JSON.stringify(body.deal_highlights);
    }
    const result = await db.prepare(`
      INSERT INTO deals (
        product_id, network, contract_months, monthly_cost, upfront_cost, 
        data_gb, minutes, texts, deal_highlights, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      body.product_id,
      body.network,
      body.contract_months,
      body.monthly_cost,
      upfront,
      body.data_gb,
      minutes,
      texts,
      highlights,
      body.is_active !== void 0 ? body.is_active ? 1 : 0 : 1,
      body.sort_order || 0
    ).first();
    return c.json({ success: true, data: result }, 201);
  } catch (err) {
    if (err instanceof ValidationError)
      return c.json({ success: false, error: err.message }, 400);
    return c.json({ success: false, error: "Failed to create deal" }, 500);
  }
});
adminDealsRouter.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = c.env.DB;
    const current = await db.prepare("SELECT * FROM deals WHERE id = ?").bind(id).first();
    if (!current)
      return c.json({ success: false, error: "Deal not found" }, 404);
    const updates = [];
    const params = [];
    const addUpdate = /* @__PURE__ */ __name((field, val) => {
      updates.push(`${field} = ?`);
      params.push(val);
    }, "addUpdate");
    if (body.product_id !== void 0)
      addUpdate("product_id", body.product_id);
    if (body.network !== void 0) {
      if (!NETWORKS.includes(body.network))
        throw new ValidationError("Invalid network");
      addUpdate("network", body.network);
    }
    if (body.contract_months !== void 0) {
      if (!CONTRACTS.includes(Number(body.contract_months)))
        throw new ValidationError("Invalid contract_months");
      addUpdate("contract_months", body.contract_months);
    }
    if (body.monthly_cost !== void 0) {
      if (Number(body.monthly_cost) <= 0)
        throw new ValidationError("Monthly cost must be > 0");
      addUpdate("monthly_cost", body.monthly_cost);
    }
    if (body.upfront_cost !== void 0)
      addUpdate("upfront_cost", body.upfront_cost);
    if (body.data_gb !== void 0)
      addUpdate("data_gb", body.data_gb);
    if (body.minutes !== void 0)
      addUpdate("minutes", body.minutes);
    if (body.texts !== void 0)
      addUpdate("texts", body.texts);
    if (body.deal_highlights !== void 0) {
      if (Array.isArray(body.deal_highlights) && body.deal_highlights.length > 4) {
        throw new ValidationError("Max 4 deal highlights allowed");
      }
      addUpdate("deal_highlights", Array.isArray(body.deal_highlights) ? JSON.stringify(body.deal_highlights) : null);
    }
    if (body.is_active !== void 0)
      addUpdate("is_active", body.is_active ? 1 : 0);
    if (body.sort_order !== void 0)
      addUpdate("sort_order", body.sort_order);
    if (updates.length === 0)
      return c.json({ success: true, data: current });
    const query = `UPDATE deals SET ${updates.join(", ")} WHERE id = ? RETURNING *`;
    params.push(id);
    const updated = await db.prepare(query).bind(...params).first();
    return c.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof ValidationError)
      return c.json({ success: false, error: err.message }, 400);
    return c.json({ success: false, error: "Failed to update deal" }, 500);
  }
});
adminDealsRouter.delete("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const db = c.env.DB;
    const { success } = await db.prepare(`DELETE FROM deals WHERE id = ?`).bind(id).run();
    if (!success)
      return c.json({ success: false, error: "Failed to delete deal" }, 500);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: "Internal error during deletion" }, 500);
  }
});
adminDealsRouter.post("/bulk-toggle", async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    validate.required(body.ids, "Deal IDs array");
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return c.json({ success: false, error: "Empty or invalid IDs array" }, 400);
    }
    const isActiveVal = body.is_active ? 1 : 0;
    const stmts = body.ids.map((id) => db.prepare("UPDATE deals SET is_active = ? WHERE id = ?").bind(isActiveVal, id));
    await db.batch(stmts);
    return c.json({ success: true, updated: body.ids.length });
  } catch (err) {
    return c.json({ success: false, error: "Failed to bulk toggle deals" }, 500);
  }
});

// worker/src/routes/categories.ts
var publicCategoriesRouter = new Hono2();
var adminCategoriesRouter = new Hono2();
publicCategoriesRouter.get("/", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, name, slug, display_order
      FROM categories
      WHERE is_active = 1
      ORDER BY display_order ASC
    `).all();
    return c.json({ success: true, data: results });
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return c.json({ success: false, error: "Failed to fetch categories" }, 500);
  }
});
adminCategoriesRouter.get("/", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, name, slug, display_order, is_active
      FROM categories
      ORDER BY display_order ASC
    `).all();
    return c.json({ success: true, data: results });
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    return c.json({ success: false, error: "Failed to fetch categories" }, 500);
  }
});
adminCategoriesRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    validate.required(body.name, "Name");
    validate.required(body.slug, "Slug");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
      throw new ValidationError('Slug must be lowercase alphanumeric with hyphens only (e.g. "apple-iphone")');
    }
    const existing = await c.env.DB.prepare(
      "SELECT id FROM categories WHERE slug = ?"
    ).bind(body.slug).first();
    if (existing) {
      return c.json({ success: false, error: `Slug "${body.slug}" is already in use` }, 409);
    }
    const displayOrder = body.display_order ? Number(body.display_order) : 99;
    const result = await c.env.DB.prepare(`
      INSERT INTO categories (name, slug, display_order, is_active)
      VALUES (?, ?, ?, 1)
      RETURNING *
    `).bind(body.name, body.slug, displayOrder).first();
    return c.json({ success: true, data: result }, 201);
  } catch (err) {
    if (err instanceof ValidationError)
      return c.json({ success: false, error: err.message }, 400);
    console.error("POST /api/admin/categories error:", err);
    return c.json({ success: false, error: "Failed to create category" }, 500);
  }
});
adminCategoriesRouter.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const current = await c.env.DB.prepare(
      "SELECT * FROM categories WHERE id = ?"
    ).bind(id).first();
    if (!current)
      return c.json({ success: false, error: "Category not found" }, 404);
    const updates = [];
    const params = [];
    if (body.name !== void 0) {
      updates.push("name = ?");
      params.push(body.name);
    }
    if (body.display_order !== void 0) {
      updates.push("display_order = ?");
      params.push(Number(body.display_order));
    }
    if (body.is_active !== void 0) {
      updates.push("is_active = ?");
      params.push(body.is_active ? 1 : 0);
    }
    if (updates.length === 0) {
      return c.json({ success: true, data: current });
    }
    const query = `UPDATE categories SET ${updates.join(", ")} WHERE id = ? RETURNING *`;
    params.push(id);
    const updated = await c.env.DB.prepare(query).bind(...params).first();
    return c.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /api/admin/categories/:id error:", err);
    return c.json({ success: false, error: "Failed to update category" }, 500);
  }
});

// worker/src/routes/sitemap.ts
var sitemapRouter = new Hono2();
var BASE_URL = "https://www.phonedealsuk.co.uk";
function xmlEscape(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
__name(xmlEscape, "xmlEscape");
function urlEntry(loc, changefreq, priority, lastmod) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>"
  ].filter(Boolean).join("\n");
}
__name(urlEntry, "urlEntry");
sitemapRouter.get("/", async (c) => {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const { results } = await c.env.DB.prepare(`
    SELECT slug, updated_at
    FROM products
    WHERE is_active = 1
    ORDER BY updated_at DESC
  `).all();
  const staticEntries = [
    urlEntry(`${BASE_URL}/`, "daily", "1.0", today),
    urlEntry(`${BASE_URL}/iphone`, "daily", "0.9", today),
    urlEntry(`${BASE_URL}/samsung`, "daily", "0.9", today)
  ];
  const productEntries = results.map((p) => {
    const lastmod = p.updated_at ? p.updated_at.split("T")[0] : today;
    return urlEntry(`${BASE_URL}/phones/${xmlEscape(p.slug)}`, "weekly", "0.8", lastmod);
  });
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    ...staticEntries,
    ...productEntries,
    "</urlset>"
  ].join("\n");
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache for 4 hours in CDN, revalidate in background
      "Cache-Control": "public, max-age=14400, stale-while-revalidate=86400"
    }
  });
});
var sitemap_default = sitemapRouter;

// worker/src/routes/images.ts
var imagesRouter = new Hono2();
imagesRouter.get("/*", async (c) => {
  let key = c.req.path;
  const match2 = key.match(/images\/(.+)$/);
  if (match2) {
    key = match2[1];
  }
  key = key.replace(/^\//, "");
  if (!key) {
    return c.json({ success: false, error: "Image key required" }, 400);
  }
  const object = await c.env.IMAGES.get(key);
  if (!object) {
    return c.notFound();
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(object.body, { headers });
});
var images_default = imagesRouter;

// worker/src/routes/admin.ts
var adminRouter = new Hono2();
function sanitiseFilename(filename) {
  const base = filename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  return `products/${Date.now()}-${base}`;
}
__name(sanitiseFilename, "sanitiseFilename");
adminRouter.post("/upload-url", async (c) => {
  try {
    const body = await c.req.json();
    if (!body?.filename || !body?.contentType) {
      return c.json({ success: false, error: "filename and contentType are required" }, 400);
    }
    const safeFilename = sanitiseFilename(body.filename);
    const publicUrl = buildPublicImageUrl(c.req.url, safeFilename, c.env.R2_PUBLIC_URL);
    const bucket = c.env.IMAGES;
    if (typeof bucket.createPresignedUrl === "function") {
      const uploadUrl = await bucket.createPresignedUrl("PUT", safeFilename, {
        expiration: 300
      });
      return c.json({
        success: true,
        data: { uploadUrl, publicUrl, filename: safeFilename }
      });
    }
    return c.json({
      success: true,
      data: {
        uploadUrl: null,
        publicUrl,
        filename: safeFilename,
        useDirectUpload: true
      }
    });
  } catch (err) {
    console.error("upload-url error:", err);
    return c.json({ success: false, error: "Failed to generate upload URL" }, 500);
  }
});
var admin_default = adminRouter;

// worker/src/routes/debug.ts
var debugRouter = new Hono2();
debugRouter.get("/image-check", async (c) => {
  const productId = c.req.query("product_id");
  if (!productId) {
    return c.json({ success: false, error: "product_id query param is required" }, 400);
  }
  const row = await c.env.DB.prepare(
    "SELECT id, name FROM products WHERE id = ?"
  ).bind(productId).first();
  if (!row) {
    return c.json({ success: false, error: "Product not found" }, 404);
  }
  let rawUrl = null;
  const r2PublicUrl = c.env.R2_PUBLIC_URL ?? null;
  return c.json({
    success: true,
    data: {
      product_id: row.id,
      name: row.name,
      primary_image_url: null,
      starts_with_https: rawUrl ? rawUrl.startsWith("https://") : false,
      r2_public_url_configured: r2PublicUrl,
      r2_public_url_from_env: r2PublicUrl ?? "(not set \u2014 local dev uses /api/images proxy)",
      hint: !rawUrl ? "No image URL stored in D1 for this product." : !rawUrl.startsWith("https://") && !rawUrl.includes("/api/images/") ? "URL may be malformed \u2014 re-upload via admin panel." : "Paste variant image url into browser to test loading."
    }
  });
});
var debug_default = debugRouter;

// worker/src/utils/sanitise.ts
var sanitise = {
  string: (val) => {
    if (val === null || val === void 0)
      return "";
    return String(val).trim();
  }
};

// worker/src/routes/checkout.ts
var checkoutRouter = new Hono2();
checkoutRouter.get("/postcode-lookup", async (c) => {
  const postcode = c.req.query("postcode");
  if (!postcode) {
    return c.json({ success: false, error: "Postcode is required" }, 400);
  }
  return c.json({
    success: true,
    data: {
      addresses: [
        { line1: "10 Downing Street", city: "London", county: "Greater London" },
        { line1: "11 Downing Street", city: "London", county: "Greater London" },
        { line1: "Flat 1, 12 Downing Street", city: "London", county: "Greater London" }
      ]
    }
  });
});
checkoutRouter.post("/create-intent", async (c) => {
  try {
    const body = await c.req.json();
    const errors = {};
    if (!body.customer?.dateOfBirth) {
      errors["dateOfBirth"] = "Date of birth is required";
    } else {
      const dobDate = new Date(body.customer.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        errors["dateOfBirth"] = "Invalid date format";
      } else if (!validate.isAdult(body.customer.dateOfBirth)) {
        errors["dateOfBirth"] = "You must be at least 18 years old";
      }
    }
    if (errors["dateOfBirth"] === "You must be at least 18 years old") {
      return c.json({
        success: false,
        error: "AGE_RESTRICTION",
        message: "You must be at least 18 years old to complete this order",
        errors
      }, 400);
    }
    if (!body.customer?.mobile || !validate.isValidUKMobile(body.customer.mobile)) {
      errors["mobile"] = "Please enter a valid UK mobile number";
    }
    const delivery = body.deliveryAddress || {};
    if (!sanitise.string(delivery.line1))
      errors["delivery.line1"] = "Delivery address line 1 is required";
    if (!sanitise.string(delivery.city))
      errors["delivery.city"] = "Delivery city is required";
    if (!sanitise.string(delivery.postcode))
      errors["delivery.postcode"] = "Delivery postcode is required";
    if (!body.sameAsDelivery) {
      const billing2 = body.billingAddress || {};
      if (!sanitise.string(billing2.line1))
        errors["billing.line1"] = "Billing address line 1 is required";
      if (!sanitise.string(billing2.city))
        errors["billing.city"] = "Billing city is required";
      if (!sanitise.string(billing2.postcode))
        errors["billing.postcode"] = "Billing postcode is required";
    }
    if (body.customer?.title && !["Mr", "Mrs", "Ms", "Miss", "Dr", "Other"].includes(body.customer.title)) {
      errors["title"] = "Invalid title selected";
    }
    if (!body.dealId) {
      errors["dealId"] = "Deal ID is required";
    } else {
      const deal = await c.env.DB.prepare("SELECT network FROM deals WHERE id = ?").bind(body.dealId).first();
      if (!deal) {
        errors["dealId"] = "Deal not found";
      } else if (body.networkProvider !== deal.network) {
        errors["networkProvider"] = "Invalid network provider for this deal";
      }
    }
    if (Object.keys(errors).length > 0) {
      return c.json({ success: false, errors }, 400);
    }
    const customerId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO customers (id, first_name, last_name, email, phone, date_of_birth, title, marketing_opt_in)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      customerId,
      sanitise.string(body.customer?.firstName),
      sanitise.string(body.customer?.lastName),
      sanitise.string(body.customer?.email),
      sanitise.string(body.customer?.mobile),
      sanitise.string(body.customer?.dateOfBirth),
      sanitise.string(body.customer?.title) || null,
      body.customer?.marketingOptIn ? 1 : 0
    ).run();
    const orderId = crypto.randomUUID();
    const billing = body.sameAsDelivery ? delivery : body.billingAddress || {};
    await c.env.DB.prepare(`
      INSERT INTO orders (
        id, customer_id, deal_id, status, network_provider, same_as_delivery,
        delivery_address_line1, delivery_address_line2, delivery_city, delivery_county, delivery_postcode,
        billing_address_line1, billing_address_line2, billing_city, billing_county, billing_postcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      customerId,
      body.dealId,
      "PENDING",
      sanitise.string(body.networkProvider),
      body.sameAsDelivery ? 1 : 0,
      sanitise.string(delivery.line1),
      sanitise.string(delivery.line2) || null,
      sanitise.string(delivery.city),
      sanitise.string(delivery.county) || null,
      sanitise.string(delivery.postcode),
      sanitise.string(billing.line1),
      sanitise.string(billing.line2) || null,
      sanitise.string(billing.city),
      sanitise.string(billing.county) || null,
      sanitise.string(billing.postcode)
    ).run();
    return c.json({ success: true, orderId });
  } catch (error) {
    console.error("Checkout error:", error);
    return c.json({ success: false, message: "Internal Server Error" }, 500);
  }
});
var checkout_default = checkoutRouter;

// worker/src/index.ts
var app = new Hono2();
var api = app.basePath("/api");
app.route("/sitemap.xml", sitemap_default);
api.get("/health", (c) => c.json({ success: true, message: "API is healthy" }));
api.route("/categories", publicCategoriesRouter);
api.route("/products", publicProductsRouter);
api.route("/deals", publicDealsRouter);
api.route("/images", images_default);
api.route("/checkout", checkout_default);
api.route("/debug", debug_default);
api.route("/admin", auth_default);
var adminRoutes = new Hono2();
adminRoutes.use("*", authMiddleware);
adminRoutes.route("/", admin_stats_default);
adminRoutes.route("/products", adminProductsRouter);
adminRoutes.route("/deals", adminDealsRouter);
adminRoutes.route("/upload", admin_upload_default);
adminRoutes.route("/", admin_default);
adminRoutes.route("/categories", adminCategoriesRouter);
api.route("/admin", adminRoutes);
var src_default = app;

// worker/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// worker/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-0wh7Pw/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// worker/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-0wh7Pw/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
