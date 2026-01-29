import React, { Component } from 'react'

class Button extends Component {
    state = {
        keyState: false,
    }

    // Turns stuff on
    on = () => 
    {   
        if (!this.state.keyState) {
            this.setState({ keyState: true });
            this.props.on(this.props.x, this.props.y, undefined, undefined, undefined, undefined, true);
        }
    }
    
    // Turns stuff off
    off = () => {
        if (this.state.keyState) {
            this.setState({ keyState: false });
            this.props.off(this.props.x, this.props.y, undefined, undefined, undefined, undefined, true);
        }
    }

    // Updates
    shouldUpdate = (nextProps) => this.props.color !== nextProps.color

    render = () => (
        <div style={{position: 'relative', display: 'grid'}}>
        {(this.isTouchDevice()) ? 
        (<button type="button" className={this.props.class} style={{backgroundColor: this.props.color, borderColor: this.props.highlight ? this.props.highlight : "#000000", borderWidth: this.props.highlight ? 5 : 2}} onTouchStart={this.on} onTouchEnd={this.off} onTouchCancel={this.off}/>) : 
        (<button type="button" className={this.props.class} style={{backgroundColor: this.props.color, borderColor: this.props.highlight ? this.props.highlight : "#000000", borderWidth: this.props.highlight ? 5 : 2}} onMouseDown={this.on} onMouseUp={this.off} onMouseLeave={this.off}/>)}
        <div className={this.props.overlayClass}/>
        </div>
    )

    isTouchDevice() {
        return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
    }
}

export default Button;