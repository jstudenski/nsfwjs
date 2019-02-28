import React, { Component } from 'react'
import logo from './logo.svg'
import ir from './ir.svg'
import tflogo from './tflogo.png'
import './App.css'
import * as nsfwjs from 'nsfwjs'
import Dropzone from 'react-dropzone'
import Switch from 'react-switch'
import * as Spinner from 'react-spinkit'
import Drop from 'tether-drop'

const blurred = { filter: 'blur(30px)', WebkitFilter: 'blur(30px)' }
const clean = {}
const loadingMessage = 'Loading NSFWJS Model'

class App extends Component {
  state = {
    model: null,
    graphic: logo,
    titleMessage: 'Please hold, the model is loading...',
    message: loadingMessage,
    predictions: [],
    droppedImageStyle: { opacity: 0.4 },
    blurNSFW: true
  }

  componentDidMount() {
    // hovercard
    this.drop = new Drop({
      target: this.hoverTarget,
      content: this.hoverContent,
      position: 'bottom left',
      openOn: 'click',
      constrainToWindow: true,
      constrainToScrollParent: true,
      remove: true
    });

    // Load model from public
    // nsfwjs.load('/model/').then(model => {
    //   this.setState({
    //     model,
    //     titleMessage: 'Drag and drop an image to check',
    //     message: 'Ready to Classify'
    //   })
    // })
  }

  _refTarget = (ref) => {
    this.hoverTarget = ref;
  };

  _refContent = (ref) => {
    this.hoverContent = ref;
  };

  // terrible race condition fix :'(
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  detectBlurStatus = (className) => {
    const { blurNSFW } = this.state
    if (blurNSFW) {
      switch (className) {
        case 'Hentai':
        case 'Porn':
        case 'Sexy':
          return blurred
        default:
          return clean
      }
    }
  }

  checkContent = async () => {
    // Sleep bc it's grabbing image before it's rendered
    // Not really a problem of this library
    await this.sleep(100)
    const img = this.refs.dropped
    const predictions = await this.state.model.classify(img)
    let droppedImageStyle = this.detectBlurStatus(predictions[0].className)
    this.setState({
      message: `Identified as ${predictions[0].className}`,
      predictions,
      droppedImageStyle
    })
  }

  setFile = file => {
    if (typeof file === 'string') {
      // using a sample
      this.setState({ graphic: file }, this.checkContent)
    } else {
      // drag and dropped
      const reader = new FileReader()
      reader.onload = e => {
        this.setState({ graphic: e.target.result }, this.checkContent)
      }

      reader.readAsDataURL(file)
    }
  }

  onDrop = (accepted, rejected) => {
    if (rejected.length > 0) {
      window.alert('JPG, PNG, GIF only plz')
    } else {
      let droppedImageStyle = this.state.blurNSFW ? blurred : clean
      this.setState({
        message: 'Processing...',
        droppedImageStyle
      })
      this.setFile(accepted[0])
    }
  }

  _renderPredictions = () => {
    return (
      <div id="predictions">
        <ul>
          {this.state.predictions.map(prediction => (
            <li>
              {prediction.className} -{' '}
              {(prediction.probability * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    )
  }

  blurChange = checked => {
    const { predictions } = this.state
    // Check on blurring
    let droppedImageStyle = clean
    if (predictions.length > 0) {
      droppedImageStyle = this.detectBlurStatus(
        predictions[0].className,
        checked
      )
    }

    this.setState({
      blurNSFW: checked,
      droppedImageStyle
    })
  }

  _renderSpinner = () => {
    if (this.state.message === loadingMessage) {
      return (
        <div id="spinContainer">
          <Spinner name="cube-grid" color="#e79f23" id="processCube" />
        </div>
      )
    }
  }

  render() {
    const {
      blurNSFW,
      droppedImageStyle,
      graphic,
      message,
      titleMessage,
    } = this.state
    return (
      <div className="App">
        <header>
          <div className="test">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Client-side indecent content checking</h1>
            <div className="snippet">
              <p>Powered by</p>
              <a href="https://js.tensorflow.org/" rel="noopener noreferrer" target="_blank">
                <img src={tflogo} id="tflogo" alt="TensorflowJS Logo" />
              </a>
            </div>
          </div>
        </header>
        <main>
          <p id="topMessage">{titleMessage}</p>
          <div>
            <Dropzone
              accept="image/jpeg, image/png, image/gif"
              className="photo-box"
              onDrop={this.onDrop.bind(this)}
            >
              <img
                src={graphic}
                style={droppedImageStyle}
                alt="drop your file here"
                className="dropped-photo"
                ref="dropped"
              />
            </Dropzone>
            <div id="underDrop">
              <div ref={this._refTarget} className="clickTarget" >
                False Positive?
                <div ref={this._refContent}>
                  <div id="fpInfo">
                    <h2>+ False Positives +</h2>
                    <p>
                      Humans are amazing at visual identification. NSFW tries to error more on the side of things being dirty than clean.
                      It's part of what makes failures on NSFW JS entertaining as well as practical. This algorithm for NSFW JS is constantly
                      getting improved, <strong>and you can help!</strong>
                    </p>
                    <h3>
                      Ways to Help!
                    </h3>
                    <ul>
                      <li>
                        <span aria-label="star" role="img">🌟</span>
                        <a href="https://github.com/alexkimxyz/nsfw_data_scrapper" rel="noopener noreferrer" target="_blank">Contribute to the Data Scraper</a> - Noticed any common misclassifications? Just PR a subreddit that represents those misclassifications.  Future models will be smarter!
                      </li>
                      <li>
                        <span aria-label="star" role="img">🌟</span>
                        <a href="https://github.com/gantman/nsfw_model" rel="noopener noreferrer" target="_blank">Contribute to the Trainer</a> - The algorithm is public. Advancements here help NSFW JS and other projects!
                      </li>
                    </ul>
                    <a href="https://medium.freecodecamp.org/machine-learning-how-to-go-from-zero-to-hero-40e26f8aa6da" target="_blank"><strong>Learn more about how Machine Learning works!</strong></a>
                  </div>
                </div>
              </div>
              <div id="switchStation">
                <p>Blur Protection</p>
                <Switch
                  onColor="#e79f23"
                  offColor="#000"
                  onChange={this.blurChange}
                  checked={blurNSFW}
                />
              </div>
            </div>
          </div>
          {this._renderSpinner()}
          <div id="results">
            <p>{message}</p>
            {this._renderPredictions()}
          </div>
        </main>
        <footer>
          <div>Copyright Now(ish)</div>
          <div>
            <a href="https://github.com/infinitered/nsfwjs">NSFWJS GitHub</a>
          </div>
          <div>
            <a href="https://github.com/gantman/nsfw_model">Model Repo</a>
          </div>
          <div>
            <a href="https://shift.infinite.red/avoid-nightmares-nsfw-js-ab7b176978b1">Blog Post</a>
          </div>
          <div>
            <a href="https://infinite.red">
              <img src={ir} alt="infinite red logo" />
            </a>
          </div>
        </footer>
      </div>
    )
  }
}

export default App
