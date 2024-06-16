import React, { Component } from "react";

class ProjectFileReader extends Component {
  constructor(props) {
    super(props);
    this.fileRef = React.createRef();
    this.state = {
      lastFileSelected: "No file chosen"
    }
  }

  onButtonClick = event => {
    this.fileRef.current.click();
  }

  onFileClick = event => {
    event.target.value = "";
  }

  onFileChange = event => {
    const fileSelected = event.target.files[0];
    let fileSelectedName = fileSelected.name;
    let fileSelectedTextSize = 12;
    if (fileSelected.name.length >= 30) {
      if (fileSelected.name.substring(0, fileSelected.name.length - 4) === fileSelected.name.slice(0, -4).toUpperCase()) {
        fileSelectedTextSize = fileSelectedTextSize - 4;
      }
      fileSelectedName = fileSelected.name.substr(0, fileSelectedTextSize) + "..." + fileSelected.name.substr(fileSelected.name.length - fileSelectedTextSize, fileSelected.name.length);
    }
    this.setState({lastFileSelected: fileSelectedName});
    this.props.loadProjectFile(fileSelected);
  }

  render() {
    return (
      <React.Fragment>
        <input type="file" id="projectFilePicker" name="projectFile" accept=".zip" hidden onChange={this.onFileChange} onClick={this.onFileClick} ref={this.fileRef}></input>
        <button className="button" style={{display: "inline", height: "17px", width: "84px"}} onClick={this.onButtonClick}>Choose File</button>
        <span style={{fontSize: "14px", marginLeft: "5px"}}>{this.state.lastFileSelected}</span>
      </React.Fragment>
    );
  }
}

export default ProjectFileReader;