import {
  BackSide,
  ClampToEdgeWrapping,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  RingBufferGeometry,
  SphereBufferGeometry,
  Texture,
  TextureLoader,
  Vector2
} from 'three';

class THREEHelper {
  static createSphereMeshFor360(texture) {
    return new Mesh(
      new SphereBufferGeometry(500, 60, 40),
      new MeshBasicMaterial({
        map: texture,
        side: BackSide
      })
    );
  }

  static load360ImageTexture(url) {
    return new Promise((resolve, reject) => {
      const texture = new TextureLoader().load(url, texture => {
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.minFilter = LinearFilter;
        resolve(texture);
      }, undefined, reject);
    });
  }

  static create360VideoTexture(video) {
    const texture = new Texture(video);
    texture.generateMipmaps = false;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.minFilter = NearestFilter;
    texture.maxFilter = NearestFilter;
    return texture;
  }

  static create360ImageMesh(url) {
    return new Promise((resolve, reject) => {
      this.load360ImageTexture(url).then(texture => {
        resolve(this.createSphereMeshFor360(texture));
      })
    });
  }

  static create360VideoMesh(video) {
    return this.createSphereMeshFor360(this.create360VideoTexture(video));
  }

  static createCrosshairMesh() {
    return new Mesh(
      new RingBufferGeometry(0.02, 0.04, 32),
      new MeshBasicMaterial( {
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
      })
    );
  }

  // @TODO: rename method name to appropriate one
  static setupVRModeSwitching(renderer, camera, controls, device) {
    const hasDevice = device !== null;
    const rendererSize = renderer.getSize(new Vector2());
    const width = rendererSize.x;
    const height = rendererSize.y;

    if (hasDevice) {
      const cameraCache = {
        position: camera.position.clone(),
        rotation: camera.rotation.clone()
      };

      window.addEventListener('vrdisplaypresentchange', event => {
        if (device.isPresenting) {
          renderer.vr.enabled = true;
          controls.enabled = false;
          cameraCache.position.copy(camera.position);
          cameraCache.rotation.copy(camera.rotation);
        } else {
          renderer.vr.enabled = false;
          controls.enabled = true;
          camera.position.copy(cameraCache.position);
          camera.rotation.copy(cameraCache.rotation);
        }
      }, false);

      renderer.vr.setDevice(device);
    } else {
      window.addEventListener('fullscreenchange', event => {
        if (document.fullscreenElement) {
          camera.aspect = screen.width / screen.height;
          camera.updateProjectionMatrix();
          renderer.setSize(screen.width, screen.height);
        } else {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }, false);
    }
  }
}

export {THREEHelper};
