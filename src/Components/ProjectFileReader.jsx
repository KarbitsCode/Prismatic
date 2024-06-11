import React, { Component } from "react";

class ProjectFileReader extends Component {
  render() {
    return (
      <React.Fragment>
        <input type="file" id="projectFilePicker" name="projectFile" accept=".zip" onChange={this.onFileChange} onClick={this.onFileClick}/>
      </React.Fragment>
    );
  }

  onFileClick = event => {
    event.target.value = ""
  }

  onFileChange = event => { 
    this.props.loadProjectFile(event.target.files[0]);
  }
}

export default ProjectFileReader;