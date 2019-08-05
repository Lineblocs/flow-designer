/*! JointJS+ - Set of JointJS compatible plugins

Copyright (c) 2013 client IO

 2014-01-22 


This Source Code Form is subject to the terms of the JointJS+ License
, v. 1.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at http://jointjs.com/license/jointjs_plus_v1.txt
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


// Command manager implements undo/redo functionality.

joint.dia.CommandManager = Backbone.Model.extend({

    defaults: {
	cmdBeforeAdd: null,
	cmdNameRegex: /^(?:add|remove|change:\w+)$/
    },

    // length of prefix 'change:' in the event name
    PREFIX_LENGTH: 7,

    initialize: function(options) {

        _.bindAll(this, 'initBatchCommand', 'storeBatchCommand');

        this.graph = options.graph;

        this.reset();
        this.listen();
    },

    listen: function() {

        this.listenTo(this.graph, 'all', this.addCommand, this);

	this.listenTo(this.graph, 'batch:start', this.initBatchCommand, this);
	this.listenTo(this.graph, 'batch:stop', this.storeBatchCommand, this);
    },

    createCommand: function(options) {
	
	var cmd = {
	    action: undefined,
	    data: { id: undefined, type: undefined, previous: {}, next: {}},
	    batch: options && options.batch
	}
	
	return cmd;
    },

    addCommand: function(cmdName, cell, graph, options) {

	if (!this.get('cmdNameRegex').test(cmdName)) {
	    return;
	}

	if (typeof this.get('cmdBeforeAdd') == 'function' && !this.get('cmdBeforeAdd').apply(this, arguments)) {
	    return;
	}

	var push = _.bind(function(cmd) {
	    
	    this.redoStack = [];

	    if (!cmd.batch) {
		this.undoStack.push(cmd);
		this.trigger('add', cmd);
	    } else {
                this.lastCmdIndex = Math.max(this.lastCmdIndex, 0);
		// Commands possible thrown away. Someone might be interested.
		this.trigger('batch', cmd);
	    }
	    
	}, this);
	
	var command = undefined;

	if (this.batchCommand) {
            // set command as the one used last.
            // in most cases we are working with same object, doing same action
            // etc. translate an object piece by piece
	    command = this.batchCommand[Math.max(this.lastCmdIndex,0)];

            // Check if we are start working with new object or performing different action with it.
            // Note, that command is uninitialized when lastCmdIndex equals -1. (see 'initBatchCommand()') 
            // in that case we are done, command we were looking for is already set
	    if (this.lastCmdIndex >= 0 && (command.data.id !== cell.id || command.action !== cmdName)) {

                // trying to find command first, which was performing same action with the object
                // as we are doing now with cell
                command = _.find(this.batchCommand, function(cmd, index) {
                    this.lastCmdIndex = index;
                    return cmd.data.id === cell.id && cmd.action === cmdName;
                }, this);

		if (!command) {
                    // command with such an id and action was not found. Let's create new one
		    this.lastCmdIndex = this.batchCommand.push(this.createCommand({ batch:  true })) - 1;
		    command = _.last(this.batchCommand);
                }
	    }
	    
	} else {
	    
            // single command
	    command = this.createCommand();
	    command.batch = false;
	    
	}

        if (cmdName === 'add' || cmdName === 'remove') {

            command.action = cmdName;
            command.data.id = cell.id;
	    command.data.type = cell.attributes.type;
            command.data.attributes = _.merge({}, cell.toJSON());
	    command.options = options || {};
	    
	    return push(command);
	}

        // `changedAttribute` holds the attribute name corresponding
	// to the change event triggered on the model.
        var changedAttribute = cmdName.substr(this.PREFIX_LENGTH);
	
	if (!command.batch || !command.action) {
	    // Do this only once. Set previous box and action (also serves as a flag so that
	    // we don't repeat this branche).
	    command.action = cmdName;
	    command.data.id = cell.id;
	    command.data.type = cell.attributes.type;
	    command.data.previous[changedAttribute] = _.clone(cell.previous(changedAttribute));
	    command.options = options || {};
	}

	command.data.next[changedAttribute] = _.clone(cell.get(changedAttribute));

	return push(command);
    },

    // Batch commands are those that merge certain commands applied in a row (1) and those that 
    // hold multiple commands where one action consists of more than one command (2)
    // (1) This is useful for e.g. when the user is dragging an object in the paper which would
    // normally lead to 1px translation commands. Applying undo() on such commands separately is
    // most likely undesirable.
    // (2) e.g When you are removing an element, you don't want all links connected to that element, which
    // are also being removed to be part of different command

    initBatchCommand: function() {

	if (!this.batchCommand) {

            this.batchCommand = [this.createCommand({ batch:  true})];
            this.lastCmdIndex = -1;

	    // batch level counts how many times has been initBatchCommand executed.
	    // It is useful when we doing an operation recursively.
	    this.batchLevel = 0;

	} else {

	    // batch command is already active
	    this.batchLevel++;
	}
    },

    storeBatchCommand: function() {

	// In order to store batch command it is necesary to run storeBatchCommand as many times as 
	// initBatchCommand was executed
        if (this.batchCommand && this.batchLevel <= 0) {

	    // checking if there is any valid command in batch
	    // for example: calling `initBatchCommand` immediately followed by `storeBatchCommand`
	    if (this.lastCmdIndex >= 0) {

		this.redoStack = [];

		this.undoStack.push(this.batchCommand);
		this.trigger('add', this.batchCommand);
	    }

            delete this.batchCommand;
            delete this.lastCmdIndex;
	    delete this.batchLevel;

        } else if (this.batchCommand && this.batchLevel > 0) {

	    // low down batch command level, but not store it yet
	    this.batchLevel--;
	}
    },

    revertCommand: function(command) {
	
        this.stopListening();

	var batchCommand;

	if (_.isArray(command)) {
	    batchCommand = command;
	} else {
	    batchCommand = [command];
	}
	
	for (var i = batchCommand.length - 1; i >= 0; i--)  {

            var cmd = batchCommand[i], cell = this.graph.getCell(cmd.data.id);
        
            switch (cmd.action) {
		
            case 'add':
		cell.remove();
		break;

            case 'remove':
		this.graph.addCell(cmd.data.attributes);
		break;

            default:
                var attribute = cmd.action.substr(this.PREFIX_LENGTH);
                cell.set(attribute, cmd.data.previous[attribute]);
                break;
            }

	}

        this.listen();
    },

    applyCommand: function(command) {

        this.stopListening();

	var batchCommand;

	if (_.isArray(command)) {
	    batchCommand = command;
	} else {
	    batchCommand = [command];
	}
	
	for (var i = 0; i < batchCommand.length; i++)  {

            var cmd = batchCommand[i], cell = this.graph.getCell(cmd.data.id);
        
            switch (cmd.action) {
            
            case 'add':
		this.graph.addCell(cmd.data.attributes);
		break;

            case 'remove':
		cell.remove();
		break;

            default:
                var attribute = cmd.action.substr(this.PREFIX_LENGTH);
                cell.set(attribute, cmd.data.next[attribute]);
                break;

	    }
	    
	}
	    
        this.listen();
    },

    undo: function() {

        var command = this.undoStack.pop();

        if (command) {

            this.revertCommand(command);
            this.redoStack.push(command);
        }
    },


    redo: function() {

        var command = this.redoStack.pop();

        if (command) {

            this.applyCommand(command);
            this.undoStack.push(command);
        }
    },

    cancel: function() {

	if (this.hasUndo()) {

	    this.revertCommand(this.undoStack.pop());
	    this.redoStack = [];
	}
    },

    reset: function() {

        this.undoStack = [];
        this.redoStack = [];
    },

    hasUndo: function() {

        return this.undoStack.length > 0;
    },

    hasRedo: function() {

        return this.redoStack.length > 0;
    }
});
