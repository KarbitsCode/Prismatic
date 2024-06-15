import React, { Component } from "react";

class AutoplayControl extends Component {
  constructor(props) {
    super(props);
    setInterval(() => {
      if (this.props.project !== undefined && this.props.project.autoplay !== undefined) {
        this.forceUpdate();
      }
    }, 1000 / 60);
  }

  render() {
    var playButton = (
      <button
        className="button"
        style={{ width: "50px", marginRight: "10px" }}
        onClick={this.playAutoplay}
      >
        Play
      </button>
    );
    var pauseButton = (
      <button
        className="button"
        style={{ width: "50px", marginRight: "10px" }}
        onClick={this.pauseAutoplay}
      >
        Pause
      </button>
    );
    var stopButton = (
      <button
        className="button"
        style={{ width: "50px", marginRight: "10px" }}
        onClick={this.stopAutoplay}
      >
        Stop
      </button>
    );
    var buttons = [];

    var statusText = "";
    if (this.props.project === undefined || this.props.project.autoplay === undefined || this.props.project.autoplay.total === 0)
      return null;
    switch (this.props.project.autoplay.status) {
      case "PLAYING":
        statusText = ` - ${(
          (this.props.project.autoplay.progress / this.props.project.autoplay.total) *
          100
        ).toFixed(2)}% completed (${this.props.project.autoplay.progress}/${
          this.props.project.autoplay.total
        })`;
        buttons.push(pauseButton);
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
    }
    return (
      <div>
        <text>{"Autoplay" + statusText}</text>
        <div />
        <input type="checkbox" checked={this.props.project.autoplay.led} onChange={() => {console.log(`LED ${!this.props.project.autoplay.led}`);this.props.project.autoplay.led = !this.props.project.autoplay.led}}/>LED
        <input type="checkbox" checked={this.props.project.autoplay.highlight} onChange={() => {console.log(`Highlight ${!this.props.project.autoplay.highlight}`);this.props.project.autoplay.highlight = !this.props.project.autoplay.highlight}}/>Highlight
        <div />
        {buttons}
      </div>
    );
  }

  playAutoplay = () => {
    if (this.props.project.autoplay !== undefined) {
      this.props.project.autoplay.play(
        // this.props.canvas.current,
        // this.props.layoutConfig.canvas_origin
      );
      console.log("Autoplay Started");
    } else {
      alert("No project loaded!");
    }
  };

  stopAutoplay = () => {
    if (this.props.project.autoplay !== undefined) {
      this.props.project.autoplay.stop();
      this.props.canvas.current.initlalizeCanvas();
      console.log("Autoplay Stopped");
    } else {
      alert("No project loaded!");
    }
  };

  pauseAutoplay = () => {
    if (this.props.project.autoplay !== undefined) {
      this.props.project.autoplay.pause();
      this.props.project.stopAll();
      console.log("Autoplay Paused");
    } else {
      alert("No project loaded!");
    }
  };
}

export default AutoplayControl;
