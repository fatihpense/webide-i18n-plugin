/* global i18nhelperutils */
define({

	_projDoc: null,
	_i18nAll: {},

	init: function() {

		jQuery.sap.require("i18n_helper_plugin/lib/i18nhelperutils");
	},

	compareFiles: function() {
		var that = this;
		this._iNotificationCount++;
		//var sMessage = this.context.i18n.getText("i18n", "sample_helloMessage", [sName]);
		var sMessage = "";
		// Display greeting notification and fire event
		//var self = this;

		//console.log(i18nhelperutils);

		return this.getCurrentProject().then(function(proj) {
			that.projDoc = proj;
			//console.log(proj);
			return that.getDocListWithFilter(that.projDoc,
				function(file) {
					if (file.endsWith('.xml')) {
						return true;
					}
					return false;
				});

		}).then(function(xmlDocList) {

			var xmlContentPromises = [];
			// scope issues 
			//for (var i = 0; i < xmlDocList.length; i++) {
			xmlDocList.forEach(function(xmlDoc, i) {
				//var xmlDoc = xmlDocList[i];

				//read content and get properties as data
				xmlContentPromises.push(
					//works but needs 2 parameters.. 
					//xmlDoc.getContent().then(i18nhelperutils.readI18nUsageFromXML)
					xmlDoc.getContent().then(function(file_cont) {
						var file_path = xmlDoc.getEntity().getFullPath();
						//console.log(file_path);
						return i18nhelperutils.readI18nUsageFromXML(file_cont, file_path);
					})
				);
			});
			//promise all resolve, return filearr
			return Q.all(xmlContentPromises).then(function(xmlReadingResultArr) {
				var i18nUsageXMLArr = Array.prototype.concat.apply([], xmlReadingResultArr);
				//console.log(i18nUsageXMLArr);

				var i18nAll = {};
				i18nUsageXMLArr.forEach(function(i18nUsage) {
					if (!i18nAll.hasOwnProperty(i18nUsage.value)) {
						i18nAll[i18nUsage.value] = {};
						i18nAll[i18nUsage.value]["key"] = i18nUsage.value;
						i18nAll[i18nUsage.value]["usedIn"] = new Set([i18nUsage.file]);
					} else {
						i18nAll[i18nUsage.value]["usedIn"].add(i18nUsage.file);
					}
				});
				//console.log(i18nAll);
				//return Q.Promise(function(resolve, reject, notify) {resolve(i18nAll);});
				that._i18nAll = i18nAll;
				return Q(i18nAll);
			});
		}).then(function(i18nAll) {

			return that.getDocListWithFilter(that.projDoc,
				function(file) {
					if (file.endsWith('.properties') && !file.endsWith('.help.properties')) {
						return true;
					}
					return false;
				});

		}).then(function(propDocList) {
			var propContentPromises = [];
			propDocList.forEach(function(propDoc, i) {
				//read content and get properties as data
				var endPromise = propDoc.getContent().then(i18nhelperutils.readProperties).then(function(properties) {
					return Q.Promise(function(resolve, reject, notify) {

						var notFoundProperties = [];
						var notUsedProperties = [];
						//Look for undefined properties
						Object.keys(that._i18nAll).forEach(function(i18nKey) {
							//var i18n = i18nAll[i18nKey];
							if (!properties.hasOwnProperty(i18nKey)) {
								notFoundProperties.push(that._i18nAll[i18nKey]);
							}
						});
						var prop_file_path = propDoc.getEntity().getFullPath();
						sMessage += '==================\nFile: ' + prop_file_path + '\n';
						notFoundProperties.forEach(function(i18nUsage) {
							//console.log(i18nUsage);
							sMessage += '#Missing key: ' + i18nUsage.key + '\n';
							i18nUsage.usedIn.forEach(function(usedIn) {
								sMessage += '#Used in: ' + usedIn + '\n';
							});
							sMessage += '\n';
						});
						sMessage += '\n\n\n';
						//our work ends here:
						resolve();
					});
				});
				propContentPromises.push(endPromise);
			});
			return Q.all(propContentPromises);
		}).then(function() {

			return that.context.service.usernotification.info(sMessage).then(function() {
				//self.context.service.log.info("test", "test: ", ["user"]).done();
			});
		});
	},

	getCurrentProject: function() {
		return this.context.service.selection.getSelection().then(function(selection) {
			if (selection && selection.length !== 0 && selection[0]) {
				return selection[0].document.getProject();
			} else {
				return Q();
			}
		});

	},
	getDocListWithFilter: function(document, filterFunc) {
		var that = this;
		return Q.Promise(function(resolve, reject, notify) {
			//if (document.getMetadata().getName() === "sap.watt.platform.plugin.filesystem.document.FolderDocument" ||
			//	document.getMetadata().getName() === "sap.watt.platform.plugin.filesystem.document.ProjectDocument") {
			if (document.getType() === "folder") {
				//get children 
				document.getFolderContent().then(function(folderContent) {
					//prepare promises
					var childPromises = [];
					for (var i = 0; i < folderContent.length; i++) {
						var childDocument = folderContent[i];
						childPromises.push(that.getDocListWithFilter(childDocument, filterFunc));
					}
					//promise all resolve, return filearr
					Q.all(childPromises).then(function(results) {
						var allChildrenFiles = Array.prototype.concat.apply([], results);
						resolve(allChildrenFiles);
					}).done(); //dont ignore errors
				});

			}
			//filedocument
			else {
				var name = document.getEntity().getName();
				//check filename with filter-func and resolve
				if (filterFunc(name)) {
					//resolve([document.getEntity().getFullPath()]);
					resolve([document]);
				} else {
					resolve([]);
				}
			}

		});

	}
});