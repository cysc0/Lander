import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';
import $ from 'jquery';

const levelLength = 1000;
const blockWidth = 1;
const H = 500;
const W = levelLength * blockWidth;
const shipWidth = 16;
const shipHeight = shipWidth;
const tickRate = (1 / 30) * 1000;
const gameName = "kim@dot.com";

class Lander extends React.Component {
    constructor(props) {
        super(props)
        this.courseID = 1
        if (props.match.path == "/play/:id") {
            this.courseID = props.match.params.id;
        }
        this.session = props.session
        let gameName = props.session.email;
        if (props.match.path == "/spectate/:email") {
            gameName = props.match.params.email;
        }
        this.socket = props.socket;
        this.channel = this.socket.channel("user:" + gameName, {});
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
            },
            particles: [],
            status: "initializing",
            fuel: 0,
            score: 0
        }
        this.channel
            .join()
            .receive("ok", (view) => {

            })
            .receive("error", (reason) => {

            })
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
            id: this.courseID,
            session: this.session
        })
            .receive("ok", (view) => {
                this.setState({ level: view.level })
                setTimeout(this.tick, tickRate)
            })
            .receive("error", (view) =>
                console.log("no op"))
        document.addEventListener("keydown", (keyEvent) => this.keyEvent(true, keyEvent.keyCode))
        document.addEventListener("keyup", (keyEvent) => this.keyEvent(false, keyEvent.keyCode))
    }

    tick = () => {
        this.channel
            .push("tick", { keymap: this.keyMap })
            .receive("ok", (view) => {
                this.setState({
                    status: view.status,
                    ship: view.ship,
                    particles: view.particles,
                    fuel: view.fuel,
                    level: view.level,
                    score: view.score
                })
            })
        if (["initializing", "playing"].includes(this.state.status) || this.state.particles.length != 0) {
            setTimeout(this.tick, tickRate)
        }
    }

    click = (x) => {
        this.channel.push("destroy", { x: x })
            .receive("ok", (view) => {
                this.setState({
                    level: view.level
                })
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
                    onClick={() => this.click(x)}
                />
            )
        });
        return result;
    }

    drawParticles = () => {
        let result = []
        _.map(this.state.particles, (p, key) => {
            result.push(
                <Circle
                    key={key}
                    x={p.x}
                    y={H - p.y}
                    radius={5}
                    fill={"orange"}
                />
            )
        })
        return result
    }

    drawShip = () => {
        if (this.state.status != "crashed" && this.state.status != "initializing") {
            return <Rect
                rotation={-1 * this.state.ship.angle}
                x={this.state.ship.x}
                y={H - this.state.ship.y}
                offsetX={shipWidth / 2}
                offsetY={shipWidth / 2}
                width={shipWidth}
                height={shipHeight}
                fill={'blue'}
                shadowBlur={5}
            />;
        }
        else {
            return null;
        }
    }

    getScore = () => {
        let text = "";
        if (this.state.status == "playing") {
            return null;
        }
        else if (this.state.status == "landed") {
            text = `Nice! Your Score: ${this.state.score}`;
        }
        else if (this.state.status == "crashed") {
            text = "Score: 0 (You Crashed!)"
        }
        return <Text
            align={"center"}
            fontFamily={"Courier New"}
            x={W / 2 - 300}
            y={H / 2 - 100}
            fontSize={32}
            text={text}
        />;
    }

    getStats = () => {
        let session_info_msg = null;
        if (this.session == null) {
            session_info_msg = <Text
                fontSize={14}
                fontFamily={"Courier New"}
                x={W - 400}
                y={20}
                text={"You must be logged in to play or interact!"}
                key={1}
            />;
        }
        return [
            <Text
                fontSize={14}
                fontFamily={"Courier New"}
                x={20}
                y={20}
                text={`Horizontal Speed: ${Math.round(this.state.ship.dx * 10)}`}
                key={1}
            />,
            <Text
                x={20}
                y={40}
                fontSize={14}
                fontFamily={"Courier New"}
                text={`Vertical Speed: ${Math.round(this.state.ship.dy * 10)}`}
                key={2}
            />,
            <Text
                x={20}
                y={60}
                fontSize={14}
                fontFamily={"Courier New"}
                text={`Fuel: ${Math.round(this.state.fuel / 4)}`}
                key={3}
            />,
            session_info_msg
        ];
    }

    render() {
        return (<Stage border="10px solid black" width={W} height={H}>
            <Layer id="background">
                <Rect
                    x={0}
                    y={0}
                    width={W}
                    height={H}
                    fill={'gray'}
                />
            </Layer>
            <Layer >
                {this.drawParticles()}
            </Layer>
            <Layer id="ship-and-level">
                {this.drawShip()}
                {this.drawLevel()}
            </ Layer>
            <Layer id="stats">
                {this.getScore()}
                {this.getStats()}
            </Layer>
        </Stage>);
    }
}

export default Lander;