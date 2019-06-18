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
        dataHead: {
            type: 'array',
            source: 'query',
            default: [],
            selector: 'th[scope="col"]',
            query: {
                content: {
                    type: 'string',
                    source: 'html'
                }
            }
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
        useColHeadings: {
            type: 'boolean',
            default: true
        },
        useRowHeadings: {
            type: 'boolean',
            default: false
        },
        useFooter: {
            type: 'boolean',
            default: false
        }
    },
    //////////////////// EDIT ////////////////////
    edit: props => {
        console.log('Edit Attributes: ',props.attributes);
        const { attributes: { dataBody, dataCaption, dataFooter, dataHead, showTable, useCaption, useColHeadings, useFooter, useRowHeadings }, className, setAttributes } = props;
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
        // Row Counter for aria labels - start at 1
        let ariaLabel, rowCounter = 1;
        // Table Head
        let tableHead, headClass = 'is-hidden';
        if(showTable) {
            headClass = '';
        }
        const tableHeadData = dataHead
        .map(function(cell, colIndex) {
            ariaLabel = 'Row '+rowCounter+' Column '+(colIndex+1);
            let currentTh = <th
                aria-label={ ariaLabel }
                scope='col'
                contenteditable='true'
            >
                { cell.content }
            </th>;
            currentTh.props.onInput = function(evt) {
                // Copy the dataHead
                let newHead = JSON.parse(JSON.stringify(dataHead));
                // Create a new cell
                let newTh = { content: evt.target.textContent };
                // Replace the old cell with the new cell
                newHead.splice(colIndex, 1, newTh);
                // Save the dataHead attribute
                props.setAttributes({ dataHead: newHead });
                // Move the cursor back where it was
                setCursor(evt);
            };
            return currentTh;
        });
        if(tableHeadData.length) {
            tableHead = <thead className={ headClass }><tr>{ tableHeadData }</tr></thead>;
        } else {
            // If there is no table head, take rowCounter back down to 0, because Table Body has to increment it before output
            rowCounter--;
        }
        // Table Body
        let tableBody, formClass = '', tableBodyData = dataBody
        .map(function(rows, rowIndex) {
            rowCounter++;
            let rowCells = rows.bodyCells.map(function(cell, colIndex) {
                // Set up options
                ariaLabel = 'Row '+rowCounter+' Column '+(colIndex+1);
                let cellType = 'd';
                let cellOptions = {
                    'aria-label': ariaLabel,
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
                if(useRowHeadings == true && colIndex == 0) { cellType = 'h'; cellOptions.scope = 'row'; }
                // Create the element - either a TD or a TH
                let currentBodyCell = el(
                    `t${cellType}`,
                    cellOptions,
                    cell.content
                )
                return currentBodyCell;
            });
            return (<tr>{rowCells}</tr>);
        });
        if(tableBodyData.length) {      
            tableBody = <tbody>{ tableBodyData }</tbody>;
			formClass = 'is-hidden';
        }
        // Table Footer
        var tableFooter, footerClass = 'is-hidden';
        if(showTable) {
            footerClass = '';
        }
        // Calculate colspan: if useRowHeadings is true, there should be 1 extra column
        let totalCols = numCols;
        if(useRowHeadings == true) {
            totalCols++;
        }
        if(useFooter == true) {
            let tableFooterTd = <td
                colspan={ totalCols }
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
                    { tableHead }
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
                        <label for='useColHeadings'>{ __('Add Column Headings') }</label>
                        <input
                            type='checkbox'
                            id='useColHeadings'
                            checked={ useColHeadings }
                            onChange={ function(evt) {
                                if(evt.target.checked == true) {
                                    props.setAttributes({ useColHeadings: true });
                                } else {
                                    props.setAttributes({ useColHeadings: false });
                                }
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
                        <label for='useRowHeadings'>{ __('Add Row Headings') }</label>
                        <input
                            type='checkbox'
                            id='useRowHeadings'
                            checked={ useRowHeadings }
                            onChange={ function(evt) {
                                if(evt.target.checked == true) {
                                    props.setAttributes({ useRowHeadings: true });
                                } else {
                                    props.setAttributes({ useRowHeadings: false });
                                }
                            }}
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
                // Number of rows will always be numRows, because if useColHeadings is true, that extra row will be in the <thead>, not the <tbody>
                // But, number of columns will vary: if useRowHeadings is true, there should be 1 extra column
                // totalCols is used to build both the thead attribute array and the tbody attribute array
                let totalCols = numCols;
                if(useRowHeadings == true) {
                    totalCols++;
                }
                // Build the thead attribute array
                let newHead = [];
                // If useColHeadings is true, add placeholders for the THs. If not, add nothing, because there should not be a thead at all.
                if(useColHeadings == true) {
                    for(var i = 0; i < totalCols; i++) {
                        newHead[i] = { content: '' };
                    }
                }
                // Build the tbody attribute array
                let newBody = [];
                for(var row = 0; row < numRows; row++) {
                    let thisRow = { bodyCells: [] };
                    for(var col = 0; col < totalCols; col++) {
                        thisRow.bodyCells[col] = { content: '' };
                    }
                    newBody[row] = thisRow;
                }
                // Save atts
                props.setAttributes({
                    dataHead: newHead,
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
        const { attributes: { dataBody, dataCaption, dataFooter, dataHead, useCaption, useColHeadings, useFooter, useRowHeadings }, className } = props;
        let numCols = parseInt(props.attributes.numCols, 10);
        let numRows = parseInt(props.attributes.numRows, 10);
        // Caption
        let tableCaption;
        if(useCaption === true) {
            tableCaption = <caption>{ dataCaption }</caption>
        }
        // Table Head
        let tableHead;
        if(useColHeadings == true) {
            const tableHeadData = dataHead.map(function(cell, colIndex) {
                return (
                    <th scope='col'>{ cell.content.trim(' ') }</th>
                );
            });
            if(tableHeadData.length) {
                tableHead = <thead><tr>{ tableHeadData }</tr></thead>;
            }
        }
        // Table Body
        let tableBody, tableBodyData = dataBody
        .map(function(rows) {
            let rowCells = rows.bodyCells.map(function(cell, colIndex) {
                if(useRowHeadings == true && colIndex == 0) {
                    return <th scope='row'>{ cell.content.trim(' ') }</th>
                } else {
                    return <td>{ cell.content.trim(' ') }</td>
                }
            });
            return (<tr>{rowCells}</tr>);
        });
        if(tableBodyData.length) {      
            tableBody = <tbody>{ tableBodyData }</tbody>;
        }
        // Table Footer
        let tableFooter;
        // Calculate colspan: if useRowHeadings is true, there should be 1 extra column
        let totalCols = numCols;
        if(useRowHeadings == true) {
            totalCols++;
        }
        if(useFooter == true) {
            tableFooter = <tfoot><tr><td colspan={ totalCols }>{ dataFooter }</td></tr></tfoot>
        }
        return (
            <table className={ className }>
                { tableCaption }
                { tableHead }
                { tableBody }
                { tableFooter }
            </table>
        );
    }
});