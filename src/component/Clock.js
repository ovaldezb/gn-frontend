import React, { Component } from 'react'
import ReactDOM from 'react-dom';

class Clock extends Component {
    state={
        time: new Date()
    }
    
    componentDidMount(){
        setInterval(this.forceUpdate, 1000);
    }

    update = ()=>{
        this.setState({
            time:new Date()
        });
    }

    render() {
        const h = this.state.time.getHours();
        const m = this.state.time.getMinutes();
        const s = this.state.time.getSeconds();
        return (
            <div>
                {h}:{(m<10?'0'+m:m)}:{(s<10?'0'+s:s)}
            </div>
        )
    }
}

ReactDOM.render(<Clock />, document.getElementById('mount'))