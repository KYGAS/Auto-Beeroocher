/**
 * Version: Apex 2
 * Configured by Ilya
 * Configured by Blasting Penis In The Sky
 * Configured by Brawndria
 */
 
 /*
   9.3.2019 Added call for TGS Inventory Submodule
			Refactorized the code
			One fuction to start all brooches
			Added command for delay
 */

var
	LEIN_ID = 80081,  
    LEIN_DELAY = 3000,                           // How much time in miliseconds should wait after buff (seconds * 1000)
	BROOCH_DELAY = 1500;
	
/**
 * DON'T CHANGE ANYTHING BELOW THIS LINE
 */
 
const skills = require('./skills');
module.exports = function AutoBroocher(dispatch) {
	
    const command = dispatch.command;
    dispatch.game.initialize('inventory'); // call for Tera-Game-State Inventory Submodule
	
    let enabled = true,
        oCid = null,
        oJob = null,
        oX = null,
        oY = null,
        oZ = null,
        oW = null,
		eqBrooch = null, // Equipped Brooch ID
        isCDBrooch = false, // if Brooch is on CD
		isCdDrink = false,
        getInfoCommand = false;
		
    command.add('beer', () => {
        enabled = !enabled;
        let txt = (enabled) ? 'ENABLED' : 'DISABLED';
        message('Auto Broocher ' + txt, true);
    });
	
    command.add('getskillinfo', () => {
        getInfoCommand = true;
        message('Use the desired skill and check proxy console.');
    });
	
	command.add('lein', {
		$default() { 
			message(`Beer delay= ${LEIN_DELAY}`,true);
    	},
    	delay(value) {
    		value = parseInt(value);
    		if (!isNaN(value)) {
    			LEIN_DELAY = value;
    			message(`Beer delay set to ${LEIN_DELAY}.`,true);
    		}
    	}
	});
	
	command.add('brooch', {
		$default() { 
			message(`Brooch delay= ${BROOCH_DELAY}.`,true);
    	},
    	delay(value) {
    		value = parseInt(value);
    		if (!isNaN(value)) {
    			BROOCH_DELAY = value;
    			message(`Brooch delay set to ${BROOCH_DELAY}.`,true);
    		}
    	}
	});
	
    dispatch.hook('S_LOGIN', 10, (event) => {
        oCid = event.gameId;
        oJob = (event.templateId - 10101) % 100;
    });
	
    dispatch.hook('C_PLAYER_LOCATION', 5, { order: -10 }, (event) => {
        oX = (event.loc.x + event.dest.x) / 2;
        oY = (event.loc.y + event.dest.y) / 2;
        oZ = (event.loc.z + event.dest.z) / 2;
        oW = event.w;
    });
	
    dispatch.hook('C_START_SKILL', 7, { order: -10 }, (event) => {
        if (!enabled) return;
        let sInfo = getSkillInfo(event.skill.id); // returns struct with skill info 
        if (getInfoCommand) {
            message('Skill info: (group: ' + sInfo.group + ' / job: ' + oJob + ')');
            getInfoCommand = false;
        }
		const brooch = dispatch.game.inventory.slots[20];
		if(brooch) { 
			for (let s = 0; s < skills.length; s++) {
            if (skills[s].group == sInfo.group && skills[s].job == oJob) { // compares skills file with sInfo struct
					beer();
					Brooch(brooch);
					break;
            }
          }
		}
    });
	
    function Brooch(bID) { // Brooch Item Data
			setTimeout(function () {
				dispatch.toServer('C_USE_ITEM', 3, {
					gameId: oCid,
					id: bID.id,
					dbid: bID.dbid,
					target: 0,
					amount: 1,
					dest: {x: 0, y: 0, z: 0},
					loc: {x: oX, y: oY, z: oZ},
					w: oW,
					unk1: 0,
					unk2: 0,
					unk3: 0,
					unk4: 1
				});
				isCDBrooch = true;
				setTimeout(function () { isCDBrooch = false; }, 180000);
			}, BROOCH_DELAY);
    }
	
	function beer() {
		if (dispatch.game.inventory.getTotalAmountInBag(LEIN_ID) > 0){
			var pivo = dispatch.game.inventory.findInBag(LEIN_ID); // get Item Beer
			setTimeout(function () {
				dispatch.toServer('C_USE_ITEM', 3, {
					gameId: oCid,
					id: pivo.id,
					dbid: pivo.dbid,
					target: 0,
					amount: 1,
					dest: {x: 0, y: 0, z: 0},
					loc: {x: oX, y: oY, z: oZ},
					w: oW,
					unk1: 0,
					unk2: 0,
					unk3: 0,
					unk4: 1
				});
				isCdDrink = true;
				setTimeout(function () { isCdDrink = false; }, 60000);
			}, LEIN_DELAY);
		}
	}
	
    function getSkillInfo(id) {
		let nid = id;
        return {
            id: nid,
            group: Math.floor(nid / 10000),
            level: Math.floor(nid / 100) % 100,
            sub: nid % 100
        };
    }
	
    function message(msg, chat = false) {
        if (chat == true) {
            command.message('(Auto Broocher) ' + msg);
        } else {
            console.log('(Auto Broocher) ' + msg);
        }
    }
	
}