class VisualTask{
    constructor(){
        this.stats={seen:0,missed:0};

        window.addEventListener('keydown',e=>{
            if(e.key===' ') this.detect();
        });
    }

    start(){
        this.active=true;
        this.loop();
    }

    stop(){ this.active=false; }

    loop(){
        if(!this.active) return;

        setTimeout(()=>{
            let el=document.createElement('div');
            el.className="floating-obj dynamic";
            let isTarget=Math.random()>0.6;

            el.innerText=isTarget?'★':'●';
            el.style.left=Math.random()*80+"%";
            el.style.top=Math.random()*40+"%";

            document.body.appendChild(el);

            let obj={el,isTarget,detected:false};

            setTimeout(()=>{
                if(isTarget && !obj.detected) this.stats.missed++;
                el.remove();
            },2000);

            this.current=obj;
            this.loop();
        },2000);
    }

    detect(){
        if(this.current && this.current.isTarget){
            this.current.detected=true;
            this.stats.seen++;
        }
    }
}