import { last, pick } from 'lodash';
import { argTypeRegistry } from './arg_type';
import { toExpression } from '../../common/lib/ast';

export class Arg {
  constructor(name, props) {
    const propNames = ['displayName', 'description', 'multiVal', 'types'];
    const argType = argTypeRegistry.get(props.argType);
    if (!argType) throw new Error(`Invalid arg type: ${props.argType}`);

    // properties that can be passed in
    const defaultProps = {
      displayName: name,
      description: name,
      multiVal: false,
      types: [],
      resolve: () => ({}),
    };

    Object.assign(this, defaultProps, pick(props, propNames), {
      name,
      argType,
    });
  }

  mapArgValue(argValue) {
    // if not multiVal, only use the last value
    const vals = (!this.multiVal) ? [last(argValue)] : argValue;

    const resolvedVal = vals.reduce((acc, val) => {
      if (val == null) {
        return acc.concat({
          type: 'string',
          value: null,
          function: null,
        });
      }

      // if value is a function, convert it to an expression
      if (val.type === 'expression' || val.type === 'partial') {
        return acc.concat({
          type: val.type,
          value: toExpression(val),
          function: val.function,
        });
      }

      // enforce types, if defined
      if (Array.isArray(this.types) && this.types.indexOf(val.type) === -1) {
        throw new Error(`${this.name} does not accept arguments of type "${val.type}"`);
      }

      return acc.concat({
        type: val.type,
        value: val.value,
        function: val.function,
      });
    }, []);

    // if multival, return array, otherwise just the value
    return (this.multiVal) ? resolvedVal : resolvedVal[0];
  }

  render({ data, resolvedData }) {
    return this.argType.template({
      data: {
        ...data,
        ...resolvedData,
        argValue: this.mapArgValue(data.argValue),
      },
      resolvedData: this.resolve(data),
      typeInstance: this,
    });
  }
}
