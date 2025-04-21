import React, { Component } from "react";

class AutoplayControl extends Component {
  constructor(props) {
    super(props);
    setInterval(() => {
      if (this.props.project !== undefined && this.props.project.autoplay !== undefined) {
        this.forceUpdate();
      };
    }, 1000 / 60);
    this.slider = React.createRef();
    this.state = {
      sliderClicked: false
    };
  };

  componentDidMount() {
    const sliderEventMountLoop = setInterval(() => {
      if (this.slider.current) {
        ["mousedown", "touchstart"].forEach((event) => {
          this.slider.current.addEventListener(event, () => {
            this.setState({ sliderClicked: true });
          }, { passive: true });
        });
        ["mouseup", "touchend"].forEach((event) => {
          this.slider.current.addEventListener(event, () => {
            this.setState({ sliderClicked: false });
          }, { passive: true });
        });
        this.slider.current.value = 0;
        clearInterval(sliderEventMountLoop);
      };
    }, 100);
  };

  render() {
    var playButton = (
      <button
        key={`playButton`}
        type="button"
        className="button control"
        onClick={this.playAutoplay}
      >
        Play
      </button>
    );
    var pauseButton = (
      <button
        key={`pauseButton`}
        type="button"
        className="button control"
        onClick={this.pauseAutoplay}
      >
        Pause
      </button>
    );
    var stopButton = (
      <button
        key={`stopButton`}
        type="button"
        className="button control"
        onClick={this.stopAutoplay}
      >
        Stop
      </button>
    );
    var buttons = [];

    var statusText = "";
    if (this.props.project === undefined || this.props.project.autoplay === undefined || this.props.project.autoplay.total === 0) {
      return null;
    };

    switch (this.props.project.autoplay.status) {
      case "PLAYING":
        statusText = ` - ${(
          (this.props.project.autoplay.progress / this.props.project.autoplay.total) *
          100
        ).toFixed(2)}% completed (${this.props.project.autoplay.progress}/${
          this.props.project.autoplay.total
        })`;
        buttons.push(pauseButton);
        if (!this.state.sliderClicked) {
          this.slider.current.value = this.props.project.autoplay.progress;
        };
        break;
      case "PAUSED":
        statusText = ` - ${(
          (this.props.project.autoplay.progress / this.props.project.autoplay.total) *
          100
        ).toFixed(2)}% completed (${this.props.project.autoplay.progress}/${
          this.props.project.autoplay.total
        }) - Paused`;
        buttons.push(playButton, stopButton);
        break;
      case "STOPPED":
        buttons.push(playButton);
        break;
      default:
    };

    return (
      <div>
        <text>{`Autoplay ${statusText}`}</text>
        <div />
        <div style={{display: "inline-flex"}}>
          <button type="button" className="seek-control" onClick={this.backwardClicked}>&#60;</button>
          <input type="range" min="0" max={this.props.project.autoplay.total} ref={this.slider} onChange={this.sliderChanged}/>
          <button type="button" className="seek-control" onClick={this.forwardClicked}>&#62;</button>
        </div>
        <div />
        <input type="checkbox" checked={this.props.project.autoplay.sound} onChange={this.soundCheckbox}/><span className="checkbox-label">Sound</span>
        <input type="checkbox" checked={this.props.project.autoplay.led} onChange={this.LEDCheckbox}/><span className="checkbox-label">LED</span>
        <input type="checkbox" checked={this.props.project.autoplay.highlight} onChange={this.highlightCheckbox}/><span className="checkbox-label">Highlight</span>
        <div />
        {buttons}
      </div>
    );
  };

  backwardClicked = () => {
    var skip = 16;
    if (this.props.project.autoplay.backward(skip)) {
      this.slider.current.value = parseInt(this.slider.current.value) - skip;
      console.log(`Seeked backward by ${skip}`);
      console.log(`Seeking to ${this.slider.current.value}`);
    } else {
      this.slider.current.value = parseInt(this.slider.current.value) - this.props.project.autoplay.total * 0.34;
    };
  };

  forwardClicked = () => {
    var skip = 16;
    if (this.props.project.autoplay.forward(skip)) {
      this.slider.current.value = parseInt(this.slider.current.value) + skip;
      console.log(`Seeked forward by ${skip}`);
      console.log(`Seeking to ${this.slider.current.value}`);
    } else {
      this.slider.current.value = parseInt(this.slider.current.value) + this.props.project.autoplay.total * 0.34;
    };
  };

  sliderChanged = () => {
    if (this.props.project.autoplay.seek(this.slider.current.value)) {
      console.log(`Seeking to ${this.slider.current.value}`);
    };
  };

  soundCheckbox = () => {
    this.props.project.stopKeySound();
    this.props.project.autoplay.sound = !this.props.project.autoplay.sound;
    console.log(`Sound ${this.props.project.autoplay.sound ? "On" : "Off"}`);
  };

  LEDCheckbox = () => {
    this.props.project.stopKeyLED();
    this.props.project.autoplay.led = !this.props.project.autoplay.led;
    console.log(`LED ${this.props.project.autoplay.led ? "On" : "Off"}`);
  };

  highlightCheckbox = () => {
    this.props.project.autoplay.highlight = !this.props.project.autoplay.highlight;
    console.log(`Highlight ${this.props.project.autoplay.highlight ? "On" : "Off"}`);
  };

  playAutoplay = () => {
    if (this.props.project.autoplay !== undefined) {
      if (this.props.project.autoplay.status === "STOPPED") {
        this.stopAutoplay();
      };
      this.props.project.stopAll();
      this.props.project.autoplay.play(
        // this.props.canvas.current,
        // this.props.layoutConfig.canvas_origin
      );
    } else {
      alert("No project loaded!");
    };
  };

  stopAutoplay = () => {
    if (this.props.project.autoplay !== undefined) {
      this.slider.current.value = 0;
      this.props.project.autoplay.stop();
      this.props.canvas.current.initlalizeCanvas();
    } else {
      alert("No project loaded!");
    };
  };

  pauseAutoplay = () => {
    if (this.props.project.autoplay !== undefined) {
      this.props.project.autoplay.pause();
      this.props.project.stopAll();
    } else {
      alert("No project loaded!");
    };
  };
}

export default AutoplayControl;
