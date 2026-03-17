import{c as o,a as l,q as h}from"./index-D2jVLG_B.js";import{j as a,m as f}from"./framer-CKv96R1r.js";import{T as u}from"./trending-down-DQMVoTDh.js";/**
 * @license lucide-react v0.363.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=o("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.363.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=o("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v0.363.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=o("Package",[["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}],["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.363.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=o("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]),g={low:u,high:y,neutral:m,no_data:x};function N({verdict:n,label:r,subtext:t,size:e="default",animated:s=!0,className:d}){const c=h[n],p=g[n],i=a.jsxs("div",{className:l("inline-flex flex-col items-center border",c.badgeBg,e==="hero"&&"rounded-2xl px-6 py-4 gap-1",e==="default"&&"rounded-full px-3 py-1.5 flex-row gap-1.5",e==="inline"&&"rounded-full px-2 py-0.5 flex-row gap-1",d),role:"status","aria-label":`Price signal: ${r}${t?`. ${t}`:""}`,children:[a.jsxs("span",{className:l("flex items-center gap-1.5",e==="hero"&&"text-2xl font-bold",e==="default"&&"text-sm font-semibold",e==="inline"&&"text-xs font-medium"),children:[a.jsx(p,{className:l(e==="hero"&&"h-7 w-7",e==="default"&&"h-4 w-4",e==="inline"&&"h-3 w-3"),"aria-hidden":"true"}),r]}),t&&e==="hero"&&a.jsx("span",{className:"text-xs font-normal opacity-70 text-center",children:t})]});return s?a.jsx(f.div,{initial:{opacity:0,scale:.88},animate:{opacity:1,scale:1},transition:{type:"spring",stiffness:400,damping:20},children:i},n):i}function S({size:n="default"}){return a.jsx("div",{className:l("skeleton",n==="hero"&&"h-[88px] w-48 rounded-2xl",n==="default"&&"h-7 w-24 rounded-full",n==="inline"&&"h-5 w-16 rounded-full")})}export{m as M,M as P,N as S,y as T,S as a};
