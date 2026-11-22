import React, { createContext, MouseEvent, ReactNode } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import classNames from 'classnames';

import { Tooltip } from '@ikigailabs/ui-core';

import { useAppSelector } from '@/app/hooks';
import { DraggableComponent } from '@/components/dnd/DraggableComponent';
import { GenerateDescriptionButton } from '@/components/generate-description-button/GenerateDescriptionButton';
import { InlineEditableText } from '@/components/inline-editable-text/InlineEditableText';
import { StatusTag } from '@/components/ui/status-tag';
import { selectIsGridView } from '@/features/grid-table-view/grid-table-view-slice';
import { ReactComponent as CheckmarkIcon } from '@/icons/checkmark.svg';
import { ReactComponent as TimeIcon } from '@/icons/time.svg';
import { ReactComponent as XIcon } from '@/icons/x.svg';
import { formatTimestamp } from '@/util/format-timestamp';
import { DescriptionOutlined } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

import { useCyclingEllipsis } from '../../util/use-cycling-ellipsis';

import type { AnyComponent } from '@/types';
import type {
  CustomConnector,
  CustomFacet,
  ProcessStatus,
} from '@ikigailabs/ikigai-core/types';

import styles from './ComponentCardComposer.module.scss';

/**
 * `componentComposer` is a utility function that provides a set of React
 * components for building UI card/table elements related to a specific
 * component type.
 *
 * @example
 * export const Composer = componentComposer<Component>();
 *
 * function FlowItem() {
 *   return (
 *     <Composer.Provider>
 *       <Composer.Container>
 *         <Composer.Header />
 *       </Composer.Container>
 *     </Composer.Provider>
 *   );
 * }
 *
 * @example - structuring a component card
 * <Composer.Container>
 *   <Composer.Row>
 *     <Composer.Column>
 *        <Composer.Data />
 *        <Composer.Label />
 *     </Composer.Column>
 *   </Composer.Row>
 * </Composer.Container>
 */
export function componentCardComposer<TComponent extends AnyComponent>() {
  const ComponentContext = createContext<TComponent | null>(null);

  function Provider({
    children,
    component,
  }: {
    children: ReactNode;
    component: TComponent;
  }) {
    return (
      <ComponentContext.Provider value={component}>
        {children}
      </ComponentContext.Provider>
    );
  }

  function useContext() {
    const context = React.useContext(ComponentContext);
    if (!context) throw new Error('useContext must be used within Provider');
    return context;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region Container
  // ───────────────────────────────────────────────────────────────────────────
  function Container({
    dataTestId,
    moreMenu,
    flowUsages,
    chartDropdown,
    children,
    onClick,
  }: {
    dataTestId?: string;
    moreMenu: ReactNode;
    flowUsages?: ReactNode;
    chartDropdown?: ReactNode;
    children: ReactNode;
    onClick?: (e: MouseEvent<HTMLElement>) => void;
  }) {
    const component = useContext();
    const isGridView = useAppSelector(selectIsGridView);
    const pageMode = useAppSelector((state) => state.pageMode);

    const content = isGridView ? (
      <article
        data-testid={dataTestId}
        id='component-card-container'
        className={classNames(styles.componentCardGridContainer, {
          [styles.viewerMode]: pageMode === 'VIEWER',
        })}
      >
        {moreMenu && <div className={styles.moreMenuContainer}>{moreMenu}</div>}
        {flowUsages && (
          <div className={styles.flowUsageContainer}>{flowUsages}</div>
        )}
        {chartDropdown && (
          <div className={styles.chartDropdownContainer}>{chartDropdown}</div>
        )}

        <section onClick={onClick} className={styles.sectionContainer}>
          {children}
        </section>
      </article>
    ) : (
      <article className={styles.componentCardTableContainer}>
        {moreMenu && <div className={styles.moreMenuContainer}>{moreMenu}</div>}
        <section onClick={onClick} className={styles.sectionContainer}>
          {children}
        </section>
      </article>
    );

    function isNonDraggableComponent(
      component: AnyComponent
    ): component is CustomFacet | CustomConnector {
      return (
        'custom_facet_id' in component || 'custom_connector_id' in component
      );
    }

    return isNonDraggableComponent(component) ? (
      content
    ) : (
      <DraggableComponent component={component}>{content}</DraggableComponent>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region Disabled Container
  // ───────────────────────────────────────────────────────────────────────────
  function DisabledContainer({
    children,
    loader,
  }: {
    children: ReactNode;
    loader?: ReactNode;
  }) {
    return (
      <article className={styles.disabledContainer}>
        {loader && <div className={styles.loader}>{loader}</div>}
        <section className={styles.sectionContainer}>{children}</section>
      </article>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region GridHeader
  // ───────────────────────────────────────────────────────────────────────────
  function GridHeader({
    icon,
    compact,
  }: {
    icon: ReactNode;
    compact?: boolean;
  }) {
    const component = useContext();
    return (
      <div
        className={classNames(styles.headerContainer, {
          [styles.headerContainerCompact]: compact,
        })}
      >
        {icon}
        <Tooltip
          title={component.name}
          placement='topLeft'
          arrow={false}
          className={styles.tooltip}
        >
          <header className={styles.headerTitle}>{component.name}</header>
        </Tooltip>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region GridHeaderEditable
  // ───────────────────────────────────────────────────────────────────────────
  function GridHeaderEditable({
    icon,
    onSubmit,
    dataTestId,
    compact,
  }: {
    icon: ReactNode;
    onSubmit: (value: string) => Promise<unknown>;
    dataTestId?: string;
    compact?: boolean;
  }) {
    const component = useContext();

    return (
      <div
        className={classNames(styles.headerContainer, {
          [styles.headerContainerCompact]: compact,
        })}
      >
        {icon}
        <InlineEditableText
          initialValue={component.name}
          onSubmit={onSubmit}
          className={styles.headerTitle}
          withTooltip
          dataTestId={dataTestId}
        />
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region GridDescriptionEditable
  // ───────────────────────────────────────────────────────────────────────────
  function GridDescriptionEditable({
    onSubmit,
    dataTestId,
    expandWithContent = false,
    enableTextClickToEdit = true,
    onGenerateDescription,
    isGeneratingDescription = false,
    descriptionAwaitingSync,
  }: {
    onSubmit: (value: string) => Promise<unknown>;
    dataTestId?: string;
    expandWithContent?: boolean;
    enableTextClickToEdit?: boolean;
    onGenerateDescription?: () => Promise<unknown>;
    isGeneratingDescription?: boolean;
    // Most recent description value submitted by the UI while persisted data is still catching up.
    descriptionAwaitingSync?: string;
  }) {
    const component = useContext();
    const [isEditingDescription, setIsEditingDescription] =
      React.useState(false);
    const [editorKey, setEditorKey] = React.useState(0);
    const [descriptionPendingSync, setDescriptionPendingSync] = React.useState<
      string | null
    >(null);
    const animatedEllipsis = useCyclingEllipsis(isGeneratingDescription);
    const persistedDescription =
      'description' in component && typeof component.description === 'string'
        ? component.description
        : '';
    const syncedDescription = descriptionAwaitingSync ?? persistedDescription;
    const initialDescription = descriptionPendingSync ?? syncedDescription;
    const hasDescription = initialDescription.trim().length > 0;
    const descriptionContainerClassName = classNames(
      styles.descriptionContainer,
      {
        [styles.descriptionContainerExpanded]: expandWithContent,
      }
    );
    const descriptionTextClassName = classNames(styles.descriptionText, {
      [styles.descriptionTextExpanded]: expandWithContent,
    });

    React.useEffect(() => {
      if (!descriptionPendingSync) return;

      if (syncedDescription.trim() === descriptionPendingSync.trim()) {
        setDescriptionPendingSync(null);
      }
    }, [descriptionPendingSync, syncedDescription]);

    const handleStartEditing = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsEditingDescription(true);
    };

    const handleGenerateDescription = async (e: MouseEvent<HTMLElement>) => {
      if (!onGenerateDescription) return;
      e.preventDefault();
      await onGenerateDescription();
    };

    const handleSubmit = async (value: string) => {
      const previousDescription = initialDescription;
      setDescriptionPendingSync(value);

      try {
        await onSubmit(value);
      } catch (error) {
        setDescriptionPendingSync(previousDescription);
        setEditorKey((currentKey) => currentKey + 1);
        throw error;
      }
    };

    const renderGenerateDescriptionButton = (alignRight = false) => {
      if (!onGenerateDescription || isGeneratingDescription) return null;

      return (
        <GenerateDescriptionButton
          compact
          className={classNames(
            styles.descriptionActionButton,
            styles.generateDescriptionIconButton,
            {
              [styles.generateDescriptionButtonRight]: alignRight,
            }
          )}
          onClick={handleGenerateDescription}
        />
      );
    };

    if (isGeneratingDescription) {
      return (
        <div className={descriptionContainerClassName}>
          <div className={classNames(styles.description)}>
            <DescriptionOutlined />
            <span
              className={classNames(
                descriptionTextClassName,
                styles.placeholder
              )}
            >
              {`generating${animatedEllipsis}`}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className={descriptionContainerClassName}>
        {!hasDescription && !isEditingDescription ? (
          <div className={styles.descriptionActions}>
            <button
              type='button'
              data-testid={dataTestId}
              className={classNames(
                descriptionTextClassName,
                styles.placeholder,
                styles.descriptionActionButton
              )}
              onClick={handleStartEditing}
            >
              <div className={styles.descriptionPlaceholderIcon}>+</div>
              <span>{' add description'}</span>
            </button>

            {renderGenerateDescriptionButton()}
          </div>
        ) : (
          <div className={styles.descriptionWithActions}>
            <div className={classNames(styles.description)}>
              <DescriptionOutlined />
              <InlineEditableText
                key={editorKey}
                initialValue={initialDescription}
                defaultIsEditing={isEditingDescription}
                enableTextClickToEdit={enableTextClickToEdit}
                onBlur={() => setIsEditingDescription(false)}
                onEscape={() => setIsEditingDescription(false)}
                onSubmit={handleSubmit}
                className={descriptionTextClassName}
                withTooltip={false}
                dataTestId={dataTestId}
              />
            </div>

            {renderGenerateDescriptionButton(true)}
          </div>
        )}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region Link
  // ───────────────────────────────────────────────────────────────────────────
  function Link({
    to,
    onClick,
    children,
  }: {
    to: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
    children: ReactNode;
  }) {
    const isGridView = useAppSelector(selectIsGridView);
    return (
      <ReactRouterLink
        to={to}
        onClick={(e) => onClick?.(e)}
        className={classNames(
          styles.link,
          isGridView ? styles.grid : styles.table
        )}
      >
        {children}
      </ReactRouterLink>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region GridRow
  // ───────────────────────────────────────────────────────────────────────────
  function GridRow({
    children,
    className,
    compact,
  }: {
    children: ReactNode;
    className?: string;
    compact?: boolean;
  }) {
    return (
      <div
        className={classNames(styles.rowContainer, className, {
          [styles.rowContainerCompact]: compact,
        })}
      >
        {children}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region GridColumn
  // ───────────────────────────────────────────────────────────────────────────
  function GridColumn({
    children,
    end,
    compact,
  }: {
    children: ReactNode;
    end?: boolean;
    compact?: boolean;
  }) {
    return (
      <div
        className={classNames(styles.columnContainer, {
          [styles.itemsEnd]: end,
          [styles.columnContainerCompact]: compact,
        })}
      >
        {children}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region Label
  // ───────────────────────────────────────────────────────────────────────────
  function Label({
    label,
    end,
    compact,
  }: {
    label: string;
    end?: boolean;
    compact?: boolean;
  }) {
    return (
      <span
        className={classNames(styles.labelContainer, {
          [styles.itemsEnd]: end,
          [styles.labelContainerCompact]: compact,
        })}
      >
        {label}
      </span>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region Data
  // ───────────────────────────────────────────────────────────────────────────
  function Data({
    status,
    data,
    compact,
  }: {
    status?: ProcessStatus;
    data?: string;
    compact?: boolean;
  }) {
    const message = data?.trim() || '—';

    switch (status) {
      case 'SUCCESS':
        return (
          <StatusTag.Green
            icon={<CheckmarkIcon width='16px' height='16px' fill='#4caf50' />}
            message={message}
            compact={compact}
          />
        );

      case 'FAILED':
      case 'STOPPED':
        return (
          <StatusTag.Red
            icon={<XIcon width='16px' height='16px' fill='#f44336' />}
            message={message}
            compact={compact}
          />
        );

      case 'RUNNING':
      case 'IN_PROGRESS':
        return (
          <StatusTag.Blue
            icon={<CircularProgress size={10} color='primary' />}
            message={message}
            compact={compact}
          />
        );

      case 'SCHEDULED':
        return (
          <StatusTag.Yellow
            icon={<TimeIcon width='16px' height='16px' fill='#b88700' />}
            message={message}
            compact={compact}
          />
        );

      default:
        return (
          <span
            className={classNames(styles.defaultSpan, {
              [styles.defaultSpanCompact]: compact,
            })}
          >
            {message}
          </span>
        );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // region GridTimeStamps
  // ───────────────────────────────────────────────────────────────────────────
  function GridProgress({ progress }: { progress?: number }) {
    if (!progress) return null;

    const normalized = Math.max(0, Math.min(progress, 100));

    return (
      <div className={styles.progressContainer}>
        <div
          className={styles.progress}
          style={{ width: `${normalized}%` }}
          aria-hidden='true'
        />
      </div>
    );
  }

  function GridTimeStamps({ compact }: { compact?: boolean }) {
    const component = useContext();
    const createdAt = formatTimestamp(component.created_at);
    const modifiedAt = formatTimestamp(component.modified_at);

    return (
      <GridRow className={styles.timeStampsContainer} compact={compact}>
        <GridColumn compact={compact}>
          <Label label='Created' compact={compact} />
          <Data data={createdAt} compact={compact} />
        </GridColumn>

        <GridColumn end compact={compact}>
          <Label label='Modified' end compact={compact} />
          <Data data={modifiedAt} compact={compact} />
        </GridColumn>
      </GridRow>
    );
  }

  return {
    useContext,
    Provider,
    Container,
    DisabledContainer,
    Link,

    GridHeader,
    GridHeaderEditable,
    GridDescriptionEditable,
    GridProgress,
    GridTimeStamps,
    GridRow,
    GridColumn,

    Label,
    Data,
  };
}
