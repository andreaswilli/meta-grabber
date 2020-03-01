import React, { Component } from 'react'
import ReactAutocomplete from 'react-autocomplete'

export default class Autocomplete extends Component {
  render() {
    return (
      <ReactAutocomplete
        wrapperStyle={{}}
        wrapperProps={{
          className: 'tv-show-input__wrapper',
        }}
        inputProps={{
          className: 'input',
          placeholder: this.props.placeholder,
          tabIndex: this.props.focusable ? '0' : '-1',
          onBlur: this.props.onBlur,
        }}
        menuStyle={{
          borderRadius: '2px',
          color: getComputedStyle(document.documentElement).getPropertyValue(
            '--color-autocomplete'
          ),
          backgroundColor: getComputedStyle(
            document.documentElement
          ).getPropertyValue('--color-bg-autocomplete'),
          padding: '6px 0',
          top: '42px',
          left: '0px',
          position: 'absolute',
          overflow: 'auto',
          maxHeight: '40vh',
          display: this.props.showDropdown ? 'block' : 'none',
          zIndex: 10,
        }}
        getItemValue={this.props.getItemValue}
        items={this.props.items}
        renderItem={(item, isHighlighted) => (
          <div
            key={this.props.getItemKey(item)}
            style={{
              color: isHighlighted
                ? getComputedStyle(document.documentElement).getPropertyValue(
                    '--color-autocomplete-selected'
                  )
                : getComputedStyle(document.documentElement).getPropertyValue(
                    '--color-autocomplete'
                  ),
              background: isHighlighted
                ? getComputedStyle(document.documentElement).getPropertyValue(
                    '--color-bg-autocomplete-selected'
                  )
                : getComputedStyle(document.documentElement).getPropertyValue(
                    '--color-bg-autocomplete'
                  ),
              minHeight: '14px',
              padding: '12px',
              lineHeight: '20px',
            }}
          >
            {this.props.getDisplayValue(item)}
          </div>
        )}
        value={this.props.value}
        onChange={this.props.onChange}
        onSelect={this.props.onSelect}
      />
    )
  }
}
