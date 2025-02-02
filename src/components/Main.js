import { Button, HelpButton, Logo, ZoomButtons } from './components';

import { CameraToolbar } from './viewport';
import { Compass32Icon } from '../icons';
import { Component } from 'react';
import ComponentsSidebar from './components/Sidebar';
import Events from '../lib/Events';
import { ModalHelp } from './modals/ModalHelp';
import ModalTextures from './modals/ModalTextures';
import SceneGraph from './scenegraph/SceneGraph';
import TransformToolbar from './viewport/TransformToolbar';
// import ViewportHUD from "./viewport/ViewportHUD";
import { injectCSS } from '../lib/utils';

THREE.ImageUtils.crossOrigin = '';

// Megahack to include font-awesome.
injectCSS(
  'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css'
);

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: null,
      inspectorEnabled: true,
      isModalTexturesOpen: false,
      sceneEl: AFRAME.scenes[0],
      visible: {
        scenegraph: true,
        attributes: true
      }
    };

    Events.on('togglesidebar', (event) => {
      if (event.which === 'all') {
        if (this.state.visible.scenegraph || this.state.visible.attributes) {
          this.setState({
            visible: {
              scenegraph: false,
              attributes: false
            }
          });
        } else {
          this.setState({
            visible: {
              scenegraph: true,
              attributes: true
            }
          });
        }
      } else if (event.which === 'attributes') {
        this.setState((prevState) => ({
          visible: {
            ...prevState.visible,
            attributes: !prevState.visible.attributes
          }
        }));
      } else if (event.which === 'scenegraph') {
        this.setState((prevState) => ({
          visible: {
            ...prevState.visible,
            scenegraph: !prevState.visible.scenegraph
          }
        }));
      }
    });
  }

  componentDidMount() {
    const htmlEditorButton = document?.querySelector(
      '.viewer-logo-start-editor-button'
    );

    htmlEditorButton && htmlEditorButton.remove();

    Events.on(
      'opentexturesmodal',
      function (selectedTexture, textureOnClose) {
        this.setState({
          selectedTexture: selectedTexture,
          isModalTexturesOpen: true,
          textureOnClose: textureOnClose
        });
      }.bind(this)
    );

    Events.on('entityselect', (entity) => {
      this.setState({ entity: entity });
    });

    Events.on('inspectortoggle', (enabled) => {
      this.setState({ inspectorEnabled: enabled });
    });

    Events.on('openhelpmodal', () => {
      this.setState({ isHelpOpen: true });
    });
  }

  onCloseHelpModal = (value) => {
    this.setState({ isHelpOpen: false });
  };

  onModalTextureOnClose = (value) => {
    this.setState({ isModalTexturesOpen: false });
    if (this.state.textureOnClose) {
      this.state.textureOnClose(value);
    }
  };

  toggleEdit = () => {
    if (this.state.inspectorEnabled) {
      AFRAME.INSPECTOR.close();
    } else {
      AFRAME.INSPECTOR.open();
    }
  };

  renderComponentsToggle() {
    if (
      !this.state.inspectorEnabled ||
      !this.state.entity ||
      this.state.visible.attributes
    ) {
      return null;
    }
    return (
      <div className="toggle-sidebar right">
        <a
          onClick={() => {
            Events.emit('togglesidebar', { which: 'attributes' });
          }}
          className="fa fa-plus"
          title="Show components"
        />
      </div>
    );
  }

  renderSceneGraphToggle() {
    if (!this.state.inspectorEnabled || this.state.visible.scenegraph) {
      return null;
    }
    return (
      <div className="toggle-sidebar left">
        <a
          onClick={() => {
            Events.emit('togglesidebar', { which: 'scenegraph' });
          }}
          className="fa fa-plus"
          title="Show scenegraph"
        />
      </div>
    );
  }

  render() {
    const scene = this.state.sceneEl;
    const isEditor = !!this.state.inspectorEnabled;

    return (
      <div>
        <Logo onToggleEdit={this.toggleEdit} isEditor={isEditor} />

        {this.renderSceneGraphToggle()}
        {this.renderComponentsToggle()}

        {isEditor && (
          <div id="inspectorContainer">
            <SceneGraph
              scene={scene}
              selectedEntity={this.state.entity}
              visible={this.state.visible.scenegraph}
            />

            <div id="viewportBar">
              <CameraToolbar />
              <TransformToolbar />
            </div>

            <div id="rightPanel">
              <ComponentsSidebar
                entity={this.state.entity}
                visible={this.state.visible.attributes}
              />
            </div>
          </div>
        )}

        <ModalHelp
          isOpen={this.state.isHelpOpen}
          onClose={this.onCloseHelpModal}
        />
        <ModalTextures
          isOpen={this.state.isModalTexturesOpen}
          selectedTexture={this.state.selectedTexture}
          onClose={this.onModalTextureOnClose}
        />

        {this.state.inspectorEnabled && (
          <div id="help">
            <HelpButton />
          </div>
        )}

        {this.state.inspectorEnabled && (
          <div id={'zoom-buttons'}>
            <ZoomButtons />
          </div>
        )}

        {this.state.inspectorEnabled && (
          <Button id={'resetZoomButton'}>
            <Compass32Icon />
          </Button>
        )}
      </div>
    );
  }
}
