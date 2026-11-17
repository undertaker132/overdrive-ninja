/* v81 · a loaded model's geometry belongs to every copy of it (the hero, the robots, the monsters): a dead enemy's cleanup no longer
   throws it away, which made the next frame upload the whole body again (a stutter on every kill). Display only. */
Pipe.on('post', 'shared81', () => { if (typeof Models === 'undefined') return; for (const id in Models.got) { const gl = Models.got[id]; if (gl && gl.scene && !gl.shared81) { gl.shared81 = 1; gl.scene.traverse(o => { if (o.geometry) o.geometry.userData.shared = 1; }); } } }, 99);
{ const in0 = Models.inst.bind(Models); Models.inst = function (id) { const gl = this.got[id]; if (gl && !gl.shared81) { gl.shared81 = 1; gl.scene.traverse(o => { if (o.geometry) o.geometry.userData.shared = 1; }); } return in0.apply(this, arguments); }; }
