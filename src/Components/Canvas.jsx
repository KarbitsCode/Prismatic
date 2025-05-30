import React, { Component } from "react";
// import ProjectFileReader from './Components/projectFileReader';
import Button from "./Button";
import { palette, rawPalette } from "../palette";
import buttonConfigs from "../buttonConfigs.js";

class Canvas extends Component {
  constructor(props) {
    super(props);
    setInterval(() => {
      this.setState({ colormap: this.state.colormap });
    }, 1000 / 60);
  }

  state = {
    colormap: new Array(this.props.layoutConfig.width).fill(null).map(() => new Array(this.props.layoutConfig.height).fill(palette[0])),
    highlightmap: new Array(this.props.layoutConfig.width).fill(null).map(() => new Array(this.props.layoutConfig.height).fill(null)),
  };

  keypressHistory = new Array(this.props.layoutConfig.width).fill(null).map(() => new Array(this.props.layoutConfig.height).fill(0));
  currentChain = 0;
  currentKeyPress = [];
  autoplay = null;

  // shouldUpdate = (nextProps) => !Object.is(this.props.layoutConfig, nextProps.layoutConfig);

  shouldComponentUpdate(nextProps) {
    if (nextProps.projectFile !== this.props.projectFile) {
      console.log("Project File Loaded");
      this.initlalizeCanvas();
    }

    if (nextProps.layoutConfig !== this.props.layoutConfig) {
      this.initlalizeCanvas(nextProps.layoutConfig);
    }

    if (nextProps.inputDevice !== this.props.inputDevice /* || prevProps.inputConfig !== this.props.inputConfig */) {
      this.setupMidiInput(nextProps.inputDevice, this.props.inputDevice);
    }

    return true;
  }

  initlalizeCanvas(config = this.props.layoutConfig) {
    this.clearCanvas(config);
    this.clearKeypressHistory();
    this.currentChain = 0;
  }

  clearCanvas(config = this.props.layoutConfig) { // eslint-disable-next-line react/no-direct-mutation-state
    this.state.colormap = new Array(config.width).fill(null).map(() => new Array(config.height).fill(palette[0])); //I write directly into state because that takes so long it will be complete by the time render is over and throw an error already. Since shouldComponentUpdate will enforce update I will give it a pass
  }

  clearKeypressHistory() {
    this.keypressHistory = new Array(8).fill(null).map(() => new Array(8).fill(0));
  }

  setupMidiInput(newInput, oldInput) {
    console.log([newInput, oldInput])
    if (oldInput !== undefined) oldInput.removeListener();
    if (newInput !== undefined) newInput.addListener("midimessage", "all", this.midiInputHandler.bind(this));
  }

  midiInputHandler = (midiEvent) => {
    console.log(midiEvent.data)
    var [event, note, velocity] = midiEvent.data
    var [x, y] = [undefined, undefined]
    if (this.props.inputConfig.noteToXY !== undefined)
    { 
      var xy = this.props.inputConfig.noteToXY(note)
      if (xy === undefined) return
      [x, y] = xy
    }
    else
    {
      [x, y] = this.indexOf2dArray(note, this.props.inputConfig.keymap); 
    }
    console.log([x, y]);
    if (x !== undefined && y !== undefined) {
      // let [canvas_x, canvas_y] = this.arrayCalculation([x, y], this.props.inputConfig.canvas_origin, "-");
      switch (event >> 4) {
        case 9: //Note On
        case 11: //Control Change
          if (velocity !== 0) {
            //Fall back to Note Off
            this.keyOn(x, y, this.props.inputConfig);
          }
          break;
        case 8: //Note Off
          this.keyOff(x, y, this.props.inputConfig);
          break;
        default:
      }
    }
  };

  keyOn = (x, y, config = this.props.layoutConfig, reverseOffset = false, spam = { sound: this.props.projectFile.autoplay.spam.sound, led: this.props.projectFile.autoplay.spam.led }) => {
    const currentKeyPressIndex = this.currentKeyPress.indexOf([x, y]);
    if (currentKeyPressIndex === -1) {
      this.currentKeyPress.push([x, y]) // 2nd parameter means remove one item only
    }

    let soundLoop = 1;
    let [canvas_x, canvas_y] = [x, y]; //canvas_XY means the grid scope XY (Square), Raw XY will be the source XY (Including the chain keys)
    if (!reverseOffset) {
      [canvas_x, canvas_y] = this.arrayCalculation([x, y], config.canvas_origin, "-");
    } else {
      [x, y] = this.arrayCalculation([x, y], config.canvas_origin, "+");
    }
    console.log(`Note On - ${x.toString()} ${y.toString()}`);
    console.log([x, y, canvas_x, canvas_y])

    if (this.props.projectFile !== undefined) {
      if (canvas_x >= 0 && canvas_x < 8 && canvas_y >= 0 && canvas_y < 8) {
        //LED
        if (this.props.projectFile.keyLED !== undefined && this.props.projectFile.keyLED[this.currentChain] !== undefined && this.props.projectFile.keyLED[this.currentChain][canvas_x] !== undefined && this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y] !== undefined && this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y].length > 0) {
          let ledIndex = this.keypressHistory[canvas_x][canvas_y] % this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y].length;
          if (!spam?.led) {
            this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y][ledIndex].stop();
          }
          this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y][ledIndex].play();
        }

        if (this.props.projectFile.keySound !== undefined && this.props.projectFile.keySound[this.currentChain] !== undefined && this.props.projectFile.keySound[this.currentChain][canvas_x] !== undefined && this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y] !== undefined && this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y].length > 0) {
          //Sound
          let soundIndex = this.keypressHistory[canvas_x][canvas_y] % this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y].length;
          console.log(`Play sound ${this.currentChain} ${canvas_x}`)
          if (this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][1] !== undefined) {
            //Has special data
            if (
              this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][1][0] !== undefined // Loop
            ) {
              soundLoop = parseInt(this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][1][0]);
            }
          }
          if (!spam?.sound) {
            this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][0].stop();
          }
          this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][0].play(soundLoop);
        }
      }
    }
  };

  checkChain = (x, y, config) => {
    if (config.chainKey !== undefined)
    {
      for (var i = 0; i < Math.min(config.chainKey.length, this.props.projectFile.info.chain); i++) {
        if (config.chainKey[i][0] === x && config.chainKey[i][1] === y) this.chainChange(i);
      }
    }
  };

  keyOff = (x, y, config = this.props.layoutConfig, reverseOffset = false, spam = { sound: this.props.projectFile.autoplay.spam.sound, led: this.props.projectFile.autoplay.spam.led }) => {
    const currentKeyPressIndex = this.currentKeyPress.indexOf([x, y]);
    if (currentKeyPressIndex > -1) {
      this.currentKeyPress.splice(currentKeyPressIndex, 1); // 2nd parameter means remove one item only
    }

    let [canvas_x, canvas_y] = [x, y]; //canvas_XY means the grid scope XY (Square), Raw XY will be the source XY (Including the chain keys)
    if (!reverseOffset) {
      [canvas_x, canvas_y] = this.arrayCalculation([x, y], config.canvas_origin, "-");
    } else {
      [x, y] = this.arrayCalculation([x, y], config.canvas_origin, "+");
    }
    console.log(`Note Off - ${x.toString()} ${y.toString()}`);

    if (this.props.projectFile !== undefined) {
      if (canvas_x >= 0 && canvas_x < 8 && canvas_y >= 0 && canvas_y < 8) {
        //LED
        if (this.props.projectFile.keyLED !== undefined && this.props.projectFile.keyLED[this.currentChain] !== undefined && this.props.projectFile.keyLED[this.currentChain][canvas_x] !== undefined && this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y] !== undefined && this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y].length > 0) {
          let ledIndex = this.keypressHistory[canvas_x][canvas_y] % this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y].length;
          if (this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y][ledIndex] !== undefined && this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y][ledIndex].repeat === 0) {
            //Page might have changed
            this.props.projectFile.keyLED[this.currentChain][canvas_x][canvas_y][ledIndex].endLoop();
          }
        }

        if (this.props.projectFile.keySound !== undefined && this.props.projectFile.keySound[this.currentChain] !== undefined && this.props.projectFile.keySound[this.currentChain][canvas_x] !== undefined && this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y] !== undefined && this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y].length > 0) {
          //Sound
          let soundIndex = this.keypressHistory[canvas_x][canvas_y] % this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y].length;
          console.log(`Play sound ${this.currentChain} ${canvas_x}`)
          if (this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][1] !== undefined) {
            if (
              this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][1][0] === "0" // Inf Loop
            ) {
              this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][0].endLoop();
            }

            if (this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][1][1] !== undefined) {
              //Wormhole
              let targetChain = parseInt(this.props.projectFile.keySound[this.currentChain][canvas_x][canvas_y][soundIndex][1][1]) - 1;
              console.log(`Wormhole to Chain ${targetChain + 1}`);
              this.chainChange(targetChain);
            }
          }
        }

        //Update History
        if (this.keypressHistory[canvas_x] !== undefined && this.keypressHistory[canvas_x][canvas_y] !== undefined) 
          this.keypressHistory[canvas_x][canvas_y]++;
      }
      else
      {
        //Chain Change
        this.checkChain(x, y, config);
      }
    }
  };

  chainChange = (chain) => {
    console.log(`Chain Changed to ${(chain + 1)}`);
    if (chain !== this.currentChain) this.clearKeypressHistory();
    this.currentChain = chain;
  };

  setColor = (x, y, color) => {
    // console.log(`Set Color ${x} ${y} ${color}`)
    this.setColorCanvas(x, y, color);
    this.setColorOutput(x, y, color);
  };

  setHighlight = (x, y, color) => {
    // console.log(`Set Color ${x} ${y} ${color}`)
    this.setHighlightCanvas(x, y, color);
  };

  getCanvasPosition(x, y) {
    var [canvas_x, canvas_y] = [undefined, undefined];
    if (x === "l") {
      if (this.props.layoutConfig.lKey === undefined) return;
      [canvas_x, canvas_y] = this.props.layoutConfig.lKey;
    } else if (x === "mc") {
      if (this.props.layoutConfig.mcTable === undefined || this.props.layoutConfig.mcTable[y] == null) return;
      [canvas_x, canvas_y] = this.props.layoutConfig.mcTable[y];
    } else if (x === "chain") {
        if (this.props.layoutConfig.chainKey === undefined || this.props.layoutConfig.chainKey[y] == null) return;
        [canvas_x, canvas_y] = this.props.layoutConfig.chainKey[y];
    } else {
      [canvas_x, canvas_y] = this.arrayCalculation([x, y], this.props.layoutConfig.canvas_origin, "+");
    }

    return [canvas_x, canvas_y];
  };

  setColorCanvas(x, y, color) {
    var [canvas_x, canvas_y] = (this.getCanvasPosition(x, y) ?? [undefined, undefined]);

    try {
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        //Check if it is a Hex String
        this.state.colormap[canvas_x][canvas_y] = color; // eslint-disable-line react/no-direct-mutation-state
      } else {
        this.state.colormap[canvas_x][canvas_y] = palette[color]; // eslint-disable-line react/no-direct-mutation-state
      }
    } catch(e) {
      // console.error(e);
      // console.error([x, y, color, canvas_x, canvas_y]);
    }
  }

  setHighlightCanvas(x, y, color = null) {
    var [canvas_x, canvas_y] = (this.getCanvasPosition(x, y) ?? [undefined, undefined]);

    try {
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        //Check if it is a Hex String
        this.state.highlightmap[canvas_x][canvas_y] = color; // eslint-disable-line react/no-direct-mutation-state
      } else {
        this.state.highlightmap[canvas_x][canvas_y] = palette[color]; // eslint-disable-line react/no-direct-mutation-state
      }
    } catch(e) {
      // console.error(e);
      // console.error([x, y, color, canvas_x, canvas_y]);
    }
  }

  getDevicePosition(x, y)
  {
    var [output_x, output_y] = [undefined, undefined];
    if (x === "l") {
      if (this.props.outputConfig.lKey === undefined) return;
      [output_x, output_y] = this.props.outputConfig.lKey;
    } else if (x === "mc") {
      if (this.props.outputConfig.mcTable === undefined || this.props.outputConfig.mcTable[y] == null) return
      [output_x, output_y] = this.props.outputConfig.mcTable[y];
    } else if (x === "chain") {
      if (this.props.layoutConfig.chainKey === undefined || this.props.layoutConfig.chainKey[y] == null) return;
      [output_x, output_y]= this.props.layoutConfig.chainKey[y];
    } else {
      [output_x, output_y] = this.arrayCalculation([x, y], this.props.outputConfig.canvas_origin, "+");
    }

    return [output_x, output_y];
  }

  setColorOutput(x, y, color) {
    if (this.props.outputDevice !== undefined && this.props.outputConfig !== undefined) {
      var output_xy = this.getDevicePosition(x, y);
      if (output_xy === undefined)
        return

      var [output_x, output_y] = output_xy;

      
      try {
        if (/^#[0-9A-F]{6}$/i.test(color)) {
          //Check if it is a Hex String
          this.sendSysex(this.props.outputConfig.hexSysexGen(output_y, output_x, color));
        } else {
          this.sendMidi("NoteOn", this.props.outputConfig.channel, this.props.outputConfig.keymap[output_y][output_x], color);
        }
      } catch(e) {
        console.error(e);
        console.error([x, y, color, output_x, output_y]);
      }
    }
  }

  sendMidi(mode, channel, note, value = 0) {
    if (typeof note === "string") {
      let modeKey = note.charAt(0);
      note = parseInt(note.substr(1));
      switch (modeKey) {
        case "C":
          mode = "CC";
          break;
        case "X":
          mode = "HEX";
          break;
        default:
          return;
      }
    }
    switch (mode) {
      case "NoteOn":
        this.props.outputDevice.send(0x90 + channel - 1, [note, value]);
        break;
      case "NoteOff":
        this.props.outputDevice.send(0x80 + channel - 1, [note, value]);
        break;
      case "CC":
        this.props.outputDevice.send(0xb0 + channel - 1, [note, value]);
        break;
      case "HEX":
        this.sendSysex(this.props.outputConfig.hexSysexGen(note, rawPalette[value]));
        break;
      default:
    }
  }

  sendSysex(message) {
    console.log(message)
    this.props.outputDevice.sendSysex([], message);
  }

  // // Overlays a color
  // colorOverlay = (hex, overlay) => {
  //   let [r, g, b] = this.toRGB(hex)
  //   let [r0, g0, b0] = this.toRGB(overlay)
  //   r = Math.round(r * (255 - r0) / 255 + r0);
  //   g = Math.round(g * (255 - g0) / 255 + g0);
  //   b = Math.round(b * (255 - b0) / 255 + b0);
  //   return this.toHEX(r, g, b)
  // }

  // // Converts a CHAD HEX color to a beta RGB color
  // toRGB = (hex) => {
  //   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  //   return [parseInt(result[1], 16),
  //           parseInt(result[2], 16),
  //           parseInt(result[3], 16)]
  // }

  // // Converts a beta RGB color to a CHAD HEX color
  // toHEX = (r, g, b) => '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b)

  // // Converts the value of a given component to CHAD HEX
  // componentToHex = (component) => {
  //   const hex = component.toString(16)
  //   return hex.length === 1 ? '0' + hex : hex
  // }

  arrayCalculation = (array1, array2, operation) => {
    let newArray = [];
    if (array1.length === array2.length) {
      switch (operation) {
        case "+":
          for (var i = 0; i < array1.length; i++) {
            newArray.push(array1[i] + array2[i]);
          }
          return newArray;
        case "-": // eslint-disable-next-line no-redeclare
          for (var i = 0; i < array1.length; i++) {
            newArray.push(array1[i] - array2[i]);
          }
          return newArray;
        default:
      }
    }
  };

  indexOf2dArray(id, matrix) {
    for (var y = 0, len = matrix.length; y < len; y++) {
      for (var x = 0, len2 = matrix[y].length; x < len2; x++) {
        if (matrix[y][x] === id) {
          return [x, y];
        }
      }
    }
    return [undefined, undefined];
  }

  render() {
    return (
      <div
        className="canvas"
        style={{
          padding: this.props.layoutConfig.padding,
          borderRadius: this.props.layoutConfig.radius,
        }}
      >
        {this.props.layoutConfig.layout.map((value, y) => {
          return (
            <div key={`${y.toString()}`} className="button-row">
              {this.props.layoutConfig.layout[y].map((value, x) => {
                if (Object.keys(buttonConfigs).includes(value))
                  {
                    return <Button key={`${x.toString()}`} x={x} y={y} class={buttonConfigs[value].class} overlayClass={buttonConfigs[value].overlayClass} color={this.state.colormap[x][y]} highlight={this.state.highlightmap[x][y]} on={this.keyOn} off={this.keyOff} />;
                  }
                  else
                  {
                    return <div key={`Spacer ${x.toString()} - ${y.toString()}`} style={{width: "96px"}}/>
                  }
                }
              )}
            </div>
          );
        })}
        {/* <button type="button" onClick={this.playAutoplay}>Auto Play</button> */}
      </div>
    );
  }
}

export default Canvas;
