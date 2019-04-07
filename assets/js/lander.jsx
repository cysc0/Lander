import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import $ from 'jquery';

const levelLength = 1000;
const blockWidth = 1;
const H = 500;
const W = levelLength * blockWidth;
const shipWidth = 16;
const shipHeight = shipWidth;
const tickRate = (1 / 30) * 1000;
// const gameName = "mike";

class Lander extends React.Component {
    constructor(props) {
        console.log(props);
        let gameName = props.email;
        super(props)
        this.courseID = props.match.params.id
        let socket = props.socket;
        this.channel = socket.channel("user:" + gameName, {});
        this.keyMap = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        this.state = {
            level: [],
            ship: {
                x: 250,
                y: 250,
                dx: 0,
                dy: 0,
                angle: 90
            }
        }
        this.channel
            .join()
            .receive("ok", (view) => {
                console.log(view);
                console.log("did mount")
            })
            .receive("error", (reason) => {
                console.log(reason)
            })
    }

    randomLevel() {
        let level = []
        let lastBlock = 100;
        for (let i = 0; i < levelLength; i++) {
            level.push(lastBlock)
            let newBlock = lastBlock + Math.floor((Math.random() * 11) - 5)
            lastBlock = newBlock;
        }
        return level;
    }

    keyEvent = (isKeyDown, keyCode) => {
        switch (keyCode) {
            case 87: // 87 = W
                this.keyMap.w = isKeyDown;
                break;
            case 65: // 65 = A
                this.keyMap.a = isKeyDown;
                break;
            case 83: // 83 = S
                this.keyMap.s = isKeyDown;
                break;
            case 68: // 68 = D
                this.keyMap.d = isKeyDown;
                break;
            default:
                break;
        }
    }

    componentDidMount() {
        this.channel.push("get_course", {
            id: this.courseID
        })
            .receive("ok", (view) =>
                this.setState({ level: view.level }))
        document.addEventListener("keydown", (keyEvent) => this.keyEvent(true, keyEvent.keyCode))
        document.addEventListener("keyup", (keyEvent) => this.keyEvent(false, keyEvent.keyCode))
        //setInterval(this.tick, tickRate)
    }

    tick = () => {
        let newShip = _.ass
        this.channel
            .push("tick", {
                ship: this.state.ship,
                keymap: this.keyMap,
                level: this.state.level
            })
            .receive("ok", (view) => {
                this.setState({ ship: view.ship })
            })
    }

    drawLevel = () => {
        let result = [];
        _.map(this.state.level, (y, x) => {
            result.push(
                <Rect
                    key={x}
                    x={x * blockWidth}
                    y={H - (y * blockWidth)}
                    width={blockWidth}
                    height={blockWidth * y}
                    fill={'black'}
                />
            )
        });
        return result;
    }

    render() {
        return (<Stage border="10px solid black" width={W} height={H}>
            <Layer>
                <Rect
                    x={0}
                    y={0}
                    width={W}
                    height={H}
                    fill={'gray'}
                />
            </Layer>
            <Layer >
                <Rect
                    rotation={-1 * this.state.ship.angle}
                    x={this.state.ship.x}
                    y={H - this.state.ship.y}
                    offsetX={shipWidth / 2}
                    offsetY={shipWidth / 2}
                    width={shipWidth}
                    height={shipHeight}
                    fill={'blue'}
                    shadowBlur={5}
                />
                {this.drawLevel()}
            </ Layer>
        </Stage>);
    }
}

export default Lander;