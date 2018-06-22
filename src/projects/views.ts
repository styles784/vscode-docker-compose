import { TreeItem, TreeItemCollapsibleState, Uri, ExtensionContext, window } from 'vscode';
import { ResourceType } from "../enums";
import { MessageNode } from "../messages/views";
import { Project } from "../projects/models";
import { ServiceNode } from "../services/views";
import { ExplorerNode } from '../explorers/views';

export class ProjectNode extends ExplorerNode {

    constructor(
        context: ExtensionContext,
        public readonly project: Project
    ) {
        super(context);
    }

    async getChildren(): Promise<ExplorerNode[]> {
        this.resetChildren();

        let services;

        try {
            this.project.refreshContainers();
        } catch (err) {
            window.showErrorMessage("Docker Compose Error: " + err.message);
            return [new MessageNode(this.context, 'Failed to retrieve project containers')];
        }

        try {
            services = this.project.getServices();
        } catch (err) {
            window.showErrorMessage("Docker Compose Error: " + err.message);
            return [new MessageNode(this.context, 'Failed to list project services')];
        }

        this.children = services
            .map(service => new ServiceNode(this.context, service));
        return this.children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(this.project.name, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Project;
        return item;
    }

}

export class ProjectsNode extends ExplorerNode {

    constructor(
        context: ExtensionContext,
        private readonly projects: Project[]
    ) {
        super(context);
    }

    async getChildren(): Promise<ExplorerNode[]> {
        this.resetChildren();

        this.children = this.projects
            .map(project => new ProjectNode(this.context, project));
        return this.children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(`Projects`, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Projects;
        return item;
    }
}
