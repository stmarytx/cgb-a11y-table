import './style.scss';
import './editor.scss';
 
const { __ } = wp.i18n;
const registerBlockType = wp.blocks.registerBlockType;
const { Dashicon } = wp.components;
const el = wp.element.createElement;
 
registerBlockType("cgb/a11y-table", {
    title: __('A11y Table'),
    icon: 'screenoptions',
    category: 'common',
    attributes: {
        dataBody: {
            type: 'array',
            source: 'query',
            default: [],
            selector: 'tbody tr',
            query: {
                bodyCells: {
                    type: 'array',
                    source: 'query',
                    default: [],
                    selector: 'td,th',
                    query: {
                        content: {
                            type: 'string',
                            source: 'html'
                        }
                    }
                }
            }
        },
        dataCaption: {
            type: 'string',
            source: 'text',
            selector: 'caption'
        },
        dataFooter: {
            type: 'string',
            source: 'text',
            selector: 'tfoot td'
        },
        numCols: {
            type: 'string',
            default: '2'
        },
        numRows: {
            type: 'string',
            default: '2'
        },
        showTable: {
            type: 'boolean',
            default: false
        },
        useCaption: {
            type: 'boolean',
            default: true
        },
        useFooter: {
            type: 'boolean',
            default: false
        }
    },
    //////////////////// EDIT ////////////////////
    edit: props => {
        const { attributes: { dataBody, dataCaption, dataFooter, showTable, useCaption, useFooter }, className, setAttributes } = props;
        let numCols = parseInt(props.attributes.numCols, 10);
        let numRows = parseInt(props.attributes.numRows, 10);
        // Caption
        let tableCaption, captionClass = 'is-hidden';
        if(showTable) {
            captionClass = '';
        }
        if(useCaption) {
            tableCaption = <caption
                className={ captionClass }
                contenteditable='true'
            >
                { dataCaption }
            </caption>;
            tableCaption.props.onInput = function(evt) {
                props.setAttributes({ dataCaption: evt.target.textContent });
                // Move the cursor back where it was
                setCursor(evt);
            };
        }
        // Table Body
        let tableBody, formClass = '', tableBodyData = dataBody
        .map(function(rows, rowIndex) {
            let rowCells = rows.bodyCells.map(function(cell, colIndex) {
                let cellOptions = {
                    contenteditable: 'true',
                    onInput: (evt) => {
                        // Copy the dataBody
                        let newBody = JSON.parse(JSON.stringify(dataBody));
                        // Create a new cell
                        let newCell = { content: evt.target.textContent };
                        // Replace the old cell
                        newBody[rowIndex].bodyCells[colIndex] = newCell;
                        // Set the attribute
                        props.setAttributes({
                            dataBody: newBody
                        });
                        // Move the cursor back where it was
                        setCursor(evt);
                    }
                };
                let currentBodyCell = el(
                    'td',
                    cellOptions,
                    cell.content
                );
                return currentBodyCell;
            });
            return (<tr>{rowCells}</tr>);
        });
        if(tableBodyData.length) {      
            tableBody = <tbody>{ tableBodyData }</tbody>;
        }
        // Table Footer
        var tableFooter, footerClass = 'is-hidden';
        if(showTable) {
            footerClass = '';
            formClass = 'is-hidden';
        }
        if(useFooter == true) {
            let tableFooterTd = <td
                colspan={ numCols }
                className={ footerClass }
                contenteditable='true'
            >
                { dataFooter }
            </td>;
            tableFooterTd.props.onInput = function(evt) {
                props.setAttributes({ dataFooter: evt.target.textContent });
                // Move the cursor back where it was
                setCursor(evt);
            };
            tableFooter = <tfoot><tr>{ tableFooterTd }</tr></tfoot>;
        }
        return (
            <div>
                <table className={ className }>
                    { tableCaption }
                    { tableBody }
                    { tableFooter }
                </table>
                <form className={ formClass }>
                    <div>
                        <label for='addCaption'>{ __('Add Caption') }</label>
                        <input
                            type='checkbox'
                            id='captionCheck'
                            checked={ useCaption }
                            onChange={ function(evt) {
                                props.setAttributes({ useCaption: evt.target.checked });
                            }}
                        />
                    </div>
                    <div>
                        <label for='numCols'>{ __('Columns') }</label>
                        <input
                            type='number'
                            id='numCols'
                            value={ numCols }
                            min='1'
                            step='1'
                            pattern='[0-9]*'
                            onChange={ (evt) => props.setAttributes({ numCols: evt.target.value }) }
                        />
                    </div>
                    <div>
                        <label for='numRows'>{ __('Rows') }</label>
                        <input
                            type='number'
                            id='numRows'
                            value={ numRows }
                            min='1'
                            step='1'
                            pattern='[0-9]*'
                            onChange={ (evt) => props.setAttributes({ numRows: evt.target.value }) }
                        />
                    </div>
                    <div>
                        <label for='addFooter'>{ __('Add Footer') }</label>
                        <input
                            type='checkbox'
                            id='footerCheck'
                            checked={ useFooter }
                            onChange={ function(evt) {
                                props.setAttributes({ useFooter: evt.target.checked });
                            }}
                        />
                    </div>
                    <button
                        type='submit'
                        onClick={evt => buildTable(evt) }
                    >
                        { __('Insert Table') }
                    </button>
                </form>
            </div>
        );
        function buildTable(evt) {
            evt.preventDefault();
            // Only build the table and hide the form if there are rows and columns
            if(numCols > 0 && numRows > 0) {
                // Build the tbody attribute array
                let newBody = [];
                for(var row = 0; row < numRows; row++) {
                    let thisRow = { bodyCells: [] };
                    for(var col = 0; col < numCols; col++) {
                        thisRow.bodyCells[col] = { content: '' };
                    }
                    newBody[row] = thisRow;
                }
                // Save atts
                props.setAttributes({
                    dataBody: newBody,
                    showTable: true
                });
            }
        }
        // Function that returns the cursor where it was, instead of the beginning of an input
        function setCursor(evt) {
            var node = evt.target;
            var caret = window.getSelection().anchorOffset;
            if(node.firstChild) {
                setTimeout(function() {
                    let textNode = node.firstChild;
                    var range = document.createRange();
                    range.setStart(textNode, caret);
                    range.setEnd(textNode, caret);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }, 1, node, caret);
            }
        }
    },
    //////////////////// SAVE ////////////////////
    save: props => {
        const { attributes: { dataBody, dataCaption, dataFooter, useCaption, useFooter }, className } = props;
        let numCols = parseInt(props.attributes.numCols, 10);
        let numRows = parseInt(props.attributes.numRows, 10);
        // Caption
        var tableCaption;
        if(useCaption === true) {
            tableCaption = <caption>{ dataCaption }</caption>
        }
        let tableBody, tableBodyData = dataBody
        .map(function(rows) {
            let rowCells = rows.bodyCells.map(function(cell) {
                let currentBodyCell = el(
                    'td',
                    '',
                    cell.content.trim(' ')
                );
                return currentBodyCell;
            });
            return (<tr>{rowCells}</tr>);
        });
        if(tableBodyData.length) {      
            tableBody = <tbody>{ tableBodyData }</tbody>;
        }
        // Table Footer
        let tableFooter;
        if(useFooter == true) {
            tableFooter = <tfoot><tr><td colspan={ numCols }>{ dataFooter }</td></tr></tfoot>
        }
        return (
            <table className={ className }>
                { tableCaption }
                { tableBody }
                { tableFooter }
            </table>
        );
    }
});