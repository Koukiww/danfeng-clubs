import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './Grainient.css'

type Props={color1?:string;color2?:string;color3?:string;className?:string;timeSpeed?:number;grainAmount?:number}
const toRgb=(hex:string)=>{const m=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return m?new Float32Array([1,2,3].map(i=>parseInt(m[i],16)/255)):new Float32Array([1,1,1])}
const vertex=`#version 300 es
in vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`
const fragment=`#version 300 es
precision highp float;uniform vec2 iResolution;uniform float iTime,uSpeed,uGrain;uniform vec3 uColor1,uColor2,uColor3;out vec4 fragColor;
vec2 hash(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(dot(hash(i)-.5,f),dot(hash(i+vec2(1,0))-.5,f-vec2(1,0)),u.x),mix(dot(hash(i+vec2(0,1))-.5,f-vec2(0,1)),dot(hash(i+vec2(1))-.5,f-vec2(1)),u.x),u.y);}
void main(){vec2 uv=gl_FragCoord.xy/iResolution.xy,p=uv-.5;p.x*=iResolution.x/iResolution.y;float t=iTime*uSpeed,n=noise(p*2.4+vec2(t*.13,-t*.09));float wave=sin((p.x+n*.55)*4.2+t*.35)*.5+.5;vec3 a=mix(uColor3,uColor2,smoothstep(-.45,.45,p.x+n*.7));vec3 col=mix(a,uColor1,smoothstep(.05,.95,wave*(.58+uv.y*.5)));float grain=fract(sin(dot(uv*2.,vec2(12.9898,78.233)))*43758.5453);col+=(grain-.5)*uGrain;fragColor=vec4(clamp(col,0.,1.),1.);}`

export default function Grainient({color1='#4E8174',color2='#1D584B',color3='#082B25',className='',timeSpeed=.22,grainAmount=.07}:Props){
 const ref=useRef<HTMLDivElement>(null)
 useEffect(()=>{const el=ref.current;if(!el)return;const renderer=new Renderer({webgl:2,alpha:true,antialias:false,dpr:Math.min(devicePixelRatio||1,2)}),gl=renderer.gl,canvas=gl.canvas as HTMLCanvasElement;el.appendChild(canvas);const uniforms={iResolution:{value:new Float32Array([1,1])},iTime:{value:0},uSpeed:{value:timeSpeed},uGrain:{value:grainAmount},uColor1:{value:toRgb(color1)},uColor2:{value:toRgb(color2)},uColor3:{value:toRgb(color3)}};const program=new Program(gl,{vertex,fragment,uniforms}),mesh=new Mesh(gl,{geometry:new Triangle(gl),program});const resize=()=>{const r=el.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height));uniforms.iResolution.value[0]=gl.drawingBufferWidth;uniforms.iResolution.value[1]=gl.drawingBufferHeight};const ro=new ResizeObserver(resize);ro.observe(el);resize();let raf=0,visible=true,pageVisible=!document.hidden,start=performance.now();const loop=(now:number)=>{uniforms.iTime.value=(now-start)/1000;renderer.render({scene:mesh});raf=requestAnimationFrame(loop)};const sync=()=>{if(visible&&pageVisible&&!raf)raf=requestAnimationFrame(loop);else if((!visible||!pageVisible)&&raf){cancelAnimationFrame(raf);raf=0}};const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()});io.observe(el);const onVis=()=>{pageVisible=!document.hidden;sync()};document.addEventListener('visibilitychange',onVis);sync();return()=>{if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',onVis);canvas.remove()}},[color1,color2,color3,timeSpeed,grainAmount]);return <div ref={ref} className={`grainient-container ${className}`.trim()}/>
}
