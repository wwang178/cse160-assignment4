class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, 100]);
        this.up = new Vector3([0, 1, 0]);
        this.panAmount = 1;
    }

    forward(distance) {
        let f = this.at.subNew(this.eye);
        f.normalize();
        f.mul(distance);
        this.eye = this.eye.addNew(f);
        this.at = this.at.addNew(f);
    }

    back(distance) {
        let f = this.at.subNew(this.eye);
        f.normalize();
        f.mul(distance);
        this.eye = this.eye.subNew(f);
        this.at = this.at.subNew(f);
    }

    left(distance) {
        let f = this.at.subNew(this.eye);
        f.normalize();
        f.mul(distance);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(distance);
        this.eye = this.eye.subNew(s);
        this.at = this.at.subNew(s);
    }

    right(distance) {
        let f = this.at.subNew(this.eye);
        f.normalize();
        f.mul(distance);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(distance);
        this.eye = this.eye.addNew(s);
        this.at = this.at.addNew(s);
    }

    moveUp(distance) {
        let moveVector = new Vector3([0, 1, 0]);
        moveVector.mul(distance);
        this.eye = this.eye.addNew(moveVector);
        this.at = this.at.addNew(moveVector);
    }

    moveDown(distance) {
        let moveVector = new Vector3([0, -1, 0]);
        moveVector.mul(distance);
        this.eye = this.eye.addNew(moveVector);
        this.at = this.at.addNew(moveVector);
    }

    panLeft(multiplier) {
        let f = this.at.subNew(this.eye);
        let rMat = new Matrix4();
        rMat.setRotate(this.panAmount * multiplier, this.up.x, this.up.y, this.up.z);
        let fPrime = rMat.multiplyVector3(f);
        this.at = this.eye.addNew(fPrime);
    }
    
    panRight(multiplier) {
        let f = this.at.subNew(this.eye);
        let rMat = new Matrix4();
        rMat.setRotate(-this.panAmount * multiplier, this.up.x, this.up.y, this.up.z);
        let fPrime = rMat.multiplyVector3(f);
        this.at = this.eye.addNew(fPrime);
    }

    panDown(multiplier) {
        let f = this.at.subNew(this.eye);
        let rightVector = Vector3.cross(this.up, f);
        rightVector.normalize();
    
        let rMat = new Matrix4();
        rMat.setRotate(this.panAmount * multiplier, rightVector.x, rightVector.y, rightVector.z);
        
        let fPrime = rMat.multiplyVector3(f);
        this.at = this.eye.addNew(fPrime);
    }

    panUp(multiplier) {
        let f = this.at.subNew(this.eye);
        let rightVector = Vector3.cross(this.up, f);
        rightVector.normalize();
    
        let rMat = new Matrix4();
        rMat.setRotate(-this.panAmount * multiplier, rightVector.x, rightVector.y, rightVector.z);
        
        let fPrime = rMat.multiplyVector3(f);
        this.at = this.eye.addNew(fPrime);
    }

    getPosInFront(distance) {
        let f = this.at.subNew(this.eye);
        f.normalize();
        f.mul(distance);
        let frontPos = this.eye.addNew(f);
        return frontPos;
    }
}