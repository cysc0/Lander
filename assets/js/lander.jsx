import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import $ from 'jquery';


export default function game_init(root, socket) {
    ReactDOM.render(<Lander socket={socket} />, root);
}

const levelLength = 50;
const blockWidth = 20;
const H = 500;
const W = levelLength * blockWidth;
const shipWidth = 15;
const shipHeight = 15;
const tickRate = (1 / 30) * 1000;
const gameName = "mike";

class Lander extends React.Component {
    constructor(props) {
        super(props)
        let { socket } = props;
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
                dy: 0
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
        for (let i = 0; i < levelLength; i++) {
            level.push(Math.floor(Math.random() * 8));
        }
        return level;
    }

    keyEvent = (isKeyDown, keyCode) => {
        switch (keyCode) {
            case 87:
                this.keyMap.w = isKeyDown;
                break;
            case 65:
                this.keyMap.a = isKeyDown;
                break;
            case 83:
                this.keyMap.s = isKeyDown;
                break;
            case 68:
                this.keyMap.d = isKeyDown;
                break;
            default:
                break;
        }
    }

    componentDidMount() {
        this.setState({ level: this.randomLevel() })
        document.addEventListener("keydown", (keyEvent) => this.keyEvent(true, keyEvent.keyCode))
        document.addEventListener("keyup", (keyEvent) => this.keyEvent(false, keyEvent.keyCode))
        setInterval(this.tick, tickRate)
    }

    tick = () => {
        let newShip = _.ass
        this.channel
            .push("tick", {
                ship: this.state.ship,
                keymap: this.keyMap
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
                    x={this.state.ship.x}
                    y={this.state.ship.y}
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