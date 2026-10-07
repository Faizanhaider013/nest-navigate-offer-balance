/**
 * ChoiceGroup — one accessible radio group, reused by all four tier controls.
 * Real <fieldset>/<legend> + native radios (keyboard + screen-reader friendly).
 * Purely presentational: it reports the chosen value; it computes nothing.
 */

import type { ChoiceOption } from "../../screens/building/presentation";

interface ChoiceGroupProps<V extends string> {
  legend: string;
  help?: string;
  name: string;
  value: V;
  options: ReadonlyArray<ChoiceOption<V>>;
  onSelect: (value: V) => void;
}

export function ChoiceGroup<V extends string>({
  legend,
  help,
  name,
  value,
  options,
  onSelect,
}: ChoiceGroupProps<V>) {
  return (
    <fieldset
      className="ob-choice"
      aria-describedby={help ? `${name}-help` : undefined}
    >
      <legend className="ob-choice-legend">{legend}</legend>
      {help ? (
        <p id={`${name}-help`} className="ob-choice-help">
          {help}
        </p>
      ) : null}
      <div className="ob-choice-options">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={selected ? "ob-option is-selected" : "ob-option"}
            >
              <input
                id={id}
                className="ob-option-input"
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                aria-labelledby={`${id}-label`}
                aria-describedby={`${id}-hint`}
                onChange={() => onSelect(option.value)}
              />
              <span id={`${id}-label`} className="ob-option-label">
                {option.label}
              </span>
              <span id={`${id}-hint`} className="ob-option-hint">
                {option.hint}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
