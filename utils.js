module.exports = {
    _types : {
        message: 'MESSAGE',
        thread: 'THREAD'
    },

    async _setTimeoutAsync(_callbackMethod, _milliseconds) {
        await new Promise((resolve, reject) => {
            setTimeout((_timeoutCallback) => {
                try {
                    _timeoutCallback()
                } catch (error) {
                    reject(error)
                }
                resolve(true)
            }, _milliseconds, _callbackMethod)
        })
    },

    async _log(_success, _type, _messageId){
        switch (_success) {
            case true:
                console.log((new Date()).toLocaleString() + ` | [${_type}] | Successfully deleted, ID ${_messageId}.`)
                break;
        
            case false:
                console.log((new Date()).toLocaleString() + ` | [${_type}] | Something went wrong, ID ${_messageId}.`)
                break;
        }
    },

    async _removeMessage(_client, _channelId, _messages) {
        await new Promise((resolve, reject) => {
            const channel = _client.channels.cache.get(_channelId)

            _messages.forEach(async (_msg) => {
                await channel.messages.fetch(_msg.id).then(async (message) => {await message.delete().then(() => this._log(true, this._types.message, _msg.id)).catch(() => this._log(false, this._types.message, _msg.id))}).catch(() => this._log(false, this._types.message, _msg.id)) // Delete message
                await channel.threads.fetch(_msg.id).then(async (thread) => {await thread.delete().then(() => this._log(true, this._types.thread, _msg.id)).catch(() => this._log(false, this._types.thread, _msg.id))}).catch(() => this._log(false, this._types.thread, _msg.id)) // Delete thread associated with message
            })

            resolve(true)
        })
    },

    async _getOldMessages (_messages, _dateNow, _messageAge) {
        let _oldMessages = []
        _messages.forEach(async _element => {
            let _messageDate = new Date(_element.createdTimestamp)
            _messageDate.setDate(_messageDate.getDate() + parseInt(_messageAge))
            
            if (_messageDate <= _dateNow){
                _oldMessages.push(_element)
            }
        })
        return _oldMessages
    },
    
    async _getAllMessages(_client, _channelId) {
        const _channel = _client.channels.cache.get(_channelId)
        let _messages = []
    
        // Create message pointer
        let _message = await _channel.messages
            .fetch({ limit: 1 })
            .then(_messagePage => (_messagePage.size === 1 ? _messagePage.at(0) : null));
    
        while (_message) {
            await _channel.messages
            .fetch({ limit: 100, before: _message.id })
            .then(_messagePage => {
                _messagePage.forEach(msg => _messages.push(msg));
    
                // Update our message pointer to be the last message on the page of messages
                _message = 0 < _messagePage.size ? _messagePage.at(_messagePage.size - 1) : null;
            });
        }
    
        return _messages
    },
    
    async messageCleanup(_client, _channelId, _intervalHours, _messageAge) {
        while(true){
            let _dateNow = new Date()

            console.log((new Date()).toLocaleString() + ' - [MESSAGECLEANUP] Start')

            const _messages = await this._getAllMessages(_client, _channelId)
            const _oldMessages = await this._getOldMessages(_messages, _dateNow, _messageAge)

            await this._removeMessage(_client, _channelId, _oldMessages)
            await this._setTimeoutAsync(() => {}, (_intervalHours*3600000)) // Loop on the _intervalHours
        }
    }
}