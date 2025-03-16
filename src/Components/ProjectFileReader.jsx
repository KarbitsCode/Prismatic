import React, { Component } from "react";

class ProjectFileReader extends Component {
  constructor(props) {
    super(props);
    this.fileRef = React.createRef();
    this.progressRef = React.createRef();
    this.state = {
      lastFileSelected: "No file chosen"
    };
  };

  onButtonClick = (event) => {
    this.fileRef.current.click();
  };

  onFileClick = (event) => {
    event.target.value = "";
  };

  onFileChange = (event) => {
    let fileSelected = event.target.files[0];
    let fileSelectedName = this.normalizeFilename(fileSelected.name);
    this.setFileSelectedDisplay(fileSelectedName);
    this.props.loadProjectFile(fileSelected);
  };

  normalizeFilename = (name) => {
    let textSize = 10;
    if (name.length >= 25) {
      if (name.substring(0, name.length - 4) === name.slice(0, -4).toUpperCase()) {
        textSize = textSize - 2;
      };
      name = `${name.substr(0, textSize)}...${name.substr(name.length - textSize, name.length)}`;
    };
    return name;
  };

  setFileSelectedDisplay = (name) => {
    this.setState({lastFileSelected: name});
  };

  setupProgressBar = (max) => {
    let progressBar = this.progressRef.current;
    progressBar.removeAttribute("hidden");
    progressBar.setAttribute("max", max);
    progressBar.value = 0;
  };

  setProgressState = (state) => {
    let progressBar = this.progressRef.current;
    progressBar.value = state;
  };

  getProgressState = () => {
    let progressBar = this.progressRef.current;
    return parseInt(progressBar.value);
  };

  cleanupProgressBar = () => {
    let progressBar = this.progressRef.current;
    progressBar.setAttribute("hidden", "");
    progressBar.removeAttribute("max");
    progressBar.value = 0;
  };

  render() {
    return (
      <React.Fragment>
        <input type="file" name="projectFile" accept=".zip" hidden onChange={this.onFileChange} onClick={this.onFileClick} ref={this.fileRef}></input>
        <button type="button" className="button chooser-label" onClick={this.onButtonClick}>Choose File</button>
        <span className="current-label">{this.state.lastFileSelected}</span><br></br>
        <input type="range" ref={this.progressRef} disabled hidden></input>
      </React.Fragment>
    );
  };
}

export default ProjectFileReader;
