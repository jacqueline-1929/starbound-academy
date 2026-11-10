import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js';

let renderer,scene,camera,subject,frame,mode;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

function clearLab(){if(frame)cancelAnimationFrame(frame);frame=null;if(renderer){renderer.dispose();renderer.domElement.replaceWith(renderer.domElement.cloneNode())}renderer=scene=camera=subject=null}

function startLab(kind){clearLab();const canvas=document.querySelector('#lab3d');if(!canvas)return;mode=kind;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(canvas.clientWidth,canvas.clientHeight,false)}catch{return}
 scene=new THREE.Scene();scene.background=new THREE.Color(kind==='force'?0x121542:0x132e2b);camera=new THREE.PerspectiveCamera(42,canvas.clientWidth/canvas.clientHeight,.1,100);camera.position.set(0,3.2,8);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xc7f8ff,0x331c54,3));const key=new THREE.DirectionalLight(0xffe17a,4);key.position.set(4,5,5);scene.add(key);
 if(kind==='force')buildForce();else buildMusic();animate()}

function buildForce(){const floor=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.4,.25,64),new THREE.MeshStandardMaterial({color:0x4d4a89,roughness:.7}));floor.position.y=-1.15;scene.add(floor);const grid=new THREE.GridHelper(7,14,0x39d9e6,0x34386f);grid.position.y=-1;scene.add(grid);subject=new THREE.Mesh(new THREE.SphereGeometry(.68,48,32),new THREE.MeshPhysicalMaterial({color:0xff706a,metalness:.05,roughness:.25,clearcoat:1}));subject.position.x=-2.8;scene.add(subject);const ring=new THREE.Mesh(new THREE.TorusGeometry(.95,.055,12,80),new THREE.MeshBasicMaterial({color:0xffd84d}));ring.rotation.x=Math.PI/2;ring.position.set(2.8,-.92,0);scene.add(ring)}

function buildMusic(){subject=new THREE.Group();const colors=[0xff706a,0xffd84d,0x39d9e6,0x896cff,0x37b96b];colors.forEach((color,i)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(1+i*.28,.08,16,96),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.18,roughness:.28}));ring.rotation.set(Math.PI/2+i*.12,i*.16,0);subject.add(ring)});scene.add(subject);const stars=new Float32Array(300);for(let i=0;i<stars.length;i++)stars[i]=(Math.random()-.5)*10;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(stars,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:.045})))}

function animate(){if(!renderer||!scene)return;frame=requestAnimationFrame(animate);if(subject&&!reduceMotion){subject.rotation.y+=mode==='music'?.008:.004;if(mode==='music')subject.rotation.z+=.003}renderer.render(scene,camera)}

addEventListener('starbound:lab',e=>requestAnimationFrame(()=>startLab(e.detail.type)));
addEventListener('starbound:force',e=>{if(!subject||mode!=='force')return;subject.position.x=-2.8;const target=-2.8+e.detail.strength*1.12;let start=performance.now();function move(now){const p=Math.min(1,(now-start)/650),ease=1-(1-p)**3;subject.position.x=-2.8+(target+2.8)*ease;subject.rotation.z-=.12;if(p<1)requestAnimationFrame(move)}requestAnimationFrame(move)});
addEventListener('starbound:note',e=>{if(!subject||mode!=='music')return;const scale=Math.min(1.45,.9+e.detail.frequency/900);setTimeout(()=>{subject.scale.setScalar(scale);setTimeout(()=>subject?.scale.setScalar(1),170)},e.detail.delay*1000)});
addEventListener('resize',()=>{const canvas=document.querySelector('#lab3d');if(!renderer||!canvas)return;renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix()});
