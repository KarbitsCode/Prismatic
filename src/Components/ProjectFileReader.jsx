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
    this.setState({lastFileSelected: event.target.files[0].name});
    this.props.loadProjectFile(event.target.files[0]);
  }

  render() {
    return (
      <React.Fragment>
        <input type="file" id="projectFilePicker" name="projectFile" accept=".zip" hidden onChange={this.onFileChange} onClick={this.onFileClick} ref={this.fileRef}></input>
        <button style={{display: "inline", height: "17px", width: "84px"}} onClick={this.onButtonClick}>Choose File</button>
		<span style={{"font-size": "14px"}}>&nbsp;{this.state.lastFileSelected}</span>
      </React.Fragment>
    );
  }
}

export default ProjectFileReader;