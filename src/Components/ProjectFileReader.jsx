import React, { Component } from "react";

class ProjectFileReader extends Component {
  constructor(props) {
    super(props);
    this.fileRef = React.createRef();
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
    const fileSelected = event.target.files[0];
    let fileSelectedName = fileSelected.name;
    let fileSelectedTextSize = 10;
    if (fileSelectedName.length >= 30) {
      if (fileSelectedName.substring(0, fileSelectedName.length - 4) === fileSelectedName.slice(0, -4).toUpperCase()) {
        fileSelectedTextSize = fileSelectedTextSize - 2;
      };
      fileSelectedName = `${fileSelectedName.substr(0, fileSelectedTextSize)}...${fileSelectedName.substr(fileSelectedName.length - fileSelectedTextSize, fileSelectedName.length)}`;
    };
    this.setState({lastFileSelected: fileSelectedName});
    this.props.loadProjectFile(fileSelected);
  };

  render() {
    return (
      <React.Fragment>
        <input type="file" id="projectFilePicker" name="projectFile" accept=".zip" hidden onChange={this.onFileChange} onClick={this.onFileClick} ref={this.fileRef}></input>
        <button type="button" className="button" style={{display: "inline", height: "17px", width: "84px"}} onClick={this.onButtonClick}>Choose File</button>
        <span style={{fontSize: "14px", marginLeft: "5px"}}>{this.state.lastFileSelected}</span>
      </React.Fragment>
    );
  };
}

export default ProjectFileReader;