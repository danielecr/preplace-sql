
export const interpolate_and_prepare = (tpl, data) => {
	if (typeof tpl !== 'string') {
		throw new TypeError(`Expected a string in the first argument, got ${typeof tpl}`);
	}

	if (typeof data !== 'object') {
		throw new TypeError(`Expected an Object/Array in the second argument, got ${typeof data}`);
	}

    const re = /\${(.*?)}/g;
	//const re = new RegExp('\\'+enclosing[0]+'(.*?)'+enclosing[1]+'','g');
    const array_re = /^([a-zA-Z0-9]*)\[(.*)\]$/;

    function _get(object, path,defval) {
        if (typeof path === "string") path = path.split(".");
        return path.reduce((xs, x) => (xs && xs[x]?xs[x]:x.replace(/\]$/,'').split(/\]?\[/).reduce( (axs, ax) =>(axs && axs[ax]? axs[ax]:defval),xs)), object);
    }
    const replaceKey = (key, data) => {
        let ret = data;
		for (const prop of key.split('.')) {
            if(!ret) break;
            if (prop.match(array_re)) {
                let matching = array_re.exec(prop);
                ret = ret[matching[1]] [matching[2]];
            } else {
                ret = ret ? ret[prop] : undefined;
            }
		}
        return ret;
    }

    const ef_and_arg = (chainPart) => {
        let re = /([^(]+)\((.*)\)/
        if (chainPart.match(re)) {
            let matching = re.exec(chainPart);
            return [ matching[1], matching[2]];
            let funName = matching[1];
            let funArgs = matching[2];
        }
        return [ undefined, undefined]
    }

    let params = [];
    let prepared = tpl.replace(re, (_,key) => {
        let ret = replaceKey(key, data);
        //let ret = _get(data, key, '');
        if(ret!==undefined) {
            params.push(ret);
            return '?';
        } else {
            // now interpolate functions
            let funChain = key.split('.');
            let funPart = funChain[0];
            let [funName, funArgs] = ef_and_arg(funPart);
            if (funName === '_swallow') {
                let arg = replaceKey(funArgs, data);
                let restOfChain = funChain.slice(1);
                let quePart;
                let valuePart = restOfChain.reduce((acc, chMethod) => {
                    let [mName, mArg] = ef_and_arg(chMethod);
                    switch(mName) {
                        case 'pluck':
                        	return acc.map(o=>o[mArg]);
                        case 'dqJoin':
                        	quePart = acc.map(x=>'"?"').join(mArg.replace(/'/g,''));
                        	return acc;
                        case 'qJoin':
                        	quePart = acc.map(x=>"'?'").join(mArg.replace(/'/g,''));
                        	return acc;
                        case 'join':
                        	quePart = acc.map(x=>'?').join(mArg.replace(/'/g,''));
                        	return acc;
                        case 'first':
                        	quePart = '?';
                        	return [acc[0]];
						case 'last':
                        	quePart = '?';
                        	return [acc[acc.length-1]];
						case 'at':
                        	quePart = '?';
                        	return [acc[mArg]];
						case 'slice':
                        	quePart = '?';
							let sliceArgs = mArg.split(',');
                        	return acc.slice(sliceArgs[0], sliceArgs[1]);
						case 'array':
							quePart = '?';
							return [acc];
                        default:
							console.log('is last');
                        	return acc;
                    }
                }, arg);
				valuePart.forEach(p=>params.push(p))
                return quePart
            }
            return '';
        }
    })
    //console.log(`PREPARED/KEYS: "${prepared}"`,params)
    return {prepared,params}

};