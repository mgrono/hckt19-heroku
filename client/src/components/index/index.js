import React from 'react';
import axios from 'axios';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import socketIOClient from 'socket.io-client';
import config from '../../client-config.json';
export default class Index extends React.Component {
    constructor(props, context) {
        super(props, context);
        //set values below
        this.state = {
            eventName: config.EVENT_TO_SUBSCRIBE, //name of event that we want to subscribe
            pubEventName: config.EVENT_TO_PUBLISH, //name of event that we want to publish
            pubEventMessage: '', //do not touch
            message: [], //do not touch
            response: false, //do not touch
            endpoint: config.HEROKU_APP_URL //our heroku app url
        }

        this.arrayBuffer = [];

        this.handleChangePubMessage = this.handleChangePubMessage.bind(this);
        this.handlePubSubmit = this.handlePubSubmit.bind(this);
    }
    handleChangePubMessage(event){
        this.setState({
            pubEventMessage: event.target.value
        })
    }
    handlePubSubmit(){
        let eventName = this.state.pubEventName;
        let eventMessage = this.state.pubEventMessage;
        
        axios.post('/event/', {
            eventName: eventName,
            data: eventMessage
        })
        .then(res => {
            if(res.status === 200){
                this.arrayBuffer.push(`>>> ${eventName} message sent: ${eventMessage}`)
                this.setState({
                    message: this.arrayBuffer
                })
                console.log(`# published ${eventName}__e event`)
            }
            
        })
        .catch(err => console.log('pub method error', err))
    }
    componentDidMount(){
        axios.get('/event/' + this.state.eventName)
            .then(res => {
                if(res.status === 200){
                    const { endpoint } = this.state;
                    const socket = socketIOClient(endpoint);
                    this.arrayBuffer.push(`# ${this.state.eventName} subscribed`);
                    this.setState({message: this.arrayBuffer})

                    socket.on(this.state.eventName, data => {
                        this.setState({response: data})
    
                        if(data && data.payload && data.payload.Message__c){
                            //setting socket response message in state
                            this.arrayBuffer.push(`<<< ${this.state.eventName} message recieved: ${data.payload.Message__c}`);
                            this.setState({
                                message: this.arrayBuffer
                            })
                        }
                    });
                }
            })
            .catch(err => {
                console.error(err);
            }) 
    }
    render(){
        return (
            <div>
                <div className="leftPanel">
                    <h2>Publish</h2>
                    <InputGroup className="mb-3 eventName">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroup-sizing-sm">Message: </InputGroup.Text>
                    </InputGroup.Prepend>
                        <FormControl onChange={this.handleChangePubMessage} aria-label="Input" aria-describedby="inputGroup-sizing-md" />
                    </InputGroup>
                    <Button onClick={this.handlePubSubmit} className="submitButton" size="lg">Submit</Button>                   
                    <br/><br/>

                    <hr/>
                </div>
                <div className='rightPanel'>
                    <div className='rightPanelBody'>
                        {this.state.message.map( (item, index) => {
                            return (
                                <div key={index}>
                                    {item}
                                </div>
                            )}
                        )}
                    </div>
                </div>   
            </div>
        )
    }
}